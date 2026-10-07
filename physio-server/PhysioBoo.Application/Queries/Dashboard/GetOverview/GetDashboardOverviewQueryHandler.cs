using PhysioBoo.Application.ViewModels.Dashboard;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Dashboard.GetOverview
{
    /// <summary>
    /// Executive dashboard: one read-only snapshot aggregated from the operational modules.
    /// Split by section across partial files (Operations, Alerts, Finance, People).
    /// Queries run one after another because every repository shares the request's DbContext.
    /// </summary>
    public sealed partial class GetDashboardOverviewQueryHandler : IRequestHandler<GetDashboardOverviewQuery, DashboardOverviewViewModel>
    {
        private const double CriticalUtilizationPct = 90;

        private readonly IWardRepository _wardRepository;
        private readonly IBedRepository _bedRepository;
        private readonly IBedAssignmentRepository _bedAssignmentRepository;
        private readonly IAdmissionRepository _admissionRepository;
        private readonly IOperatingRoomRepository _operatingRoomRepository;
        private readonly ISurgeryCaseRepository _surgeryCaseRepository;
        private readonly ISurgeryAlertRepository _surgeryAlertRepository;
        private readonly IClinicalAlertRepository _clinicalAlertRepository;
        private readonly IInventoryAlertRepository _inventoryAlertRepository;
        private readonly ILabAlertRepository _labAlertRepository;
        private readonly IRadiologyAlertRepository _radiologyAlertRepository;
        private readonly IPaymentRepository _paymentRepository;
        private readonly IInsuranceClaimRepository _insuranceClaimRepository;
        private readonly IDispenseSessionRepository _dispenseSessionRepository;
        private readonly ILabOrderItemRepository _labOrderItemRepository;
        private readonly IImagingOrderRepository _imagingOrderRepository;
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IDoctorRepository _doctorRepository;
        private readonly IDoctorScheduleRepository _doctorScheduleRepository;
        private readonly IDoctorLeaveRepository _doctorLeaveRepository;
        private readonly IHospitalStaffRepository _hospitalStaffRepository;

        public GetDashboardOverviewQueryHandler(
            IWardRepository wardRepository,
            IBedRepository bedRepository,
            IBedAssignmentRepository bedAssignmentRepository,
            IAdmissionRepository admissionRepository,
            IOperatingRoomRepository operatingRoomRepository,
            ISurgeryCaseRepository surgeryCaseRepository,
            ISurgeryAlertRepository surgeryAlertRepository,
            IClinicalAlertRepository clinicalAlertRepository,
            IInventoryAlertRepository inventoryAlertRepository,
            ILabAlertRepository labAlertRepository,
            IRadiologyAlertRepository radiologyAlertRepository,
            IPaymentRepository paymentRepository,
            IInsuranceClaimRepository insuranceClaimRepository,
            IDispenseSessionRepository dispenseSessionRepository,
            ILabOrderItemRepository labOrderItemRepository,
            IImagingOrderRepository imagingOrderRepository,
            IAppointmentRepository appointmentRepository,
            IDoctorRepository doctorRepository,
            IDoctorScheduleRepository doctorScheduleRepository,
            IDoctorLeaveRepository doctorLeaveRepository,
            IHospitalStaffRepository hospitalStaffRepository)
        {
            _wardRepository = wardRepository;
            _bedRepository = bedRepository;
            _bedAssignmentRepository = bedAssignmentRepository;
            _admissionRepository = admissionRepository;
            _operatingRoomRepository = operatingRoomRepository;
            _surgeryCaseRepository = surgeryCaseRepository;
            _surgeryAlertRepository = surgeryAlertRepository;
            _clinicalAlertRepository = clinicalAlertRepository;
            _inventoryAlertRepository = inventoryAlertRepository;
            _labAlertRepository = labAlertRepository;
            _radiologyAlertRepository = radiologyAlertRepository;
            _paymentRepository = paymentRepository;
            _insuranceClaimRepository = insuranceClaimRepository;
            _dispenseSessionRepository = dispenseSessionRepository;
            _labOrderItemRepository = labOrderItemRepository;
            _imagingOrderRepository = imagingOrderRepository;
            _appointmentRepository = appointmentRepository;
            _doctorRepository = doctorRepository;
            _doctorScheduleRepository = doctorScheduleRepository;
            _doctorLeaveRepository = doctorLeaveRepository;
            _hospitalStaffRepository = hospitalStaffRepository;
        }

        public async Task<DashboardOverviewViewModel> Handle(GetDashboardOverviewQuery request, CancellationToken ct)
        {
            DateTime now = TimeZoneHelper.GetLocalTimeNow();
            DateOnly day = request.Date ?? DateOnly.FromDateTime(now);
            DateTime dayStart = day.ToDateTime(TimeOnly.MinValue);
            DateTime dayEnd = dayStart.AddDays(1);
            string shiftLabel = ShiftLabel(request.Shift, now);

            List<WardOccupancyViewModel> beds = await GetBedCapacityAsync(ct);
            List<DepartmentLoadViewModel> departmentLoad = await GetDepartmentLoadAsync(ct);
            PatientFlowSummaryViewModel patientFlow = await GetPatientFlowAsync(dayStart, dayEnd, ct);
            (int orActive, int orTotal) = await GetOperatingRoomUseAsync(ct);
            List<OperationTheatreViewModel> operations = await GetActiveOperationsAsync(dayStart, dayEnd, now, ct);
            DashboardAlertsViewModel alerts = await GetAlertsAsync(ct);
            FinancialClinicalSnapshotViewModel financial = await GetFinancialAsync(day, dayStart, dayEnd, ct);
            AppointmentFlowSummaryViewModel appointments = await GetAppointmentFlowAsync(day, ct);
            StaffDutySummaryViewModel staff = await GetStaffDutyAsync(day, shiftLabel, ct);
            List<DashboardEventViewModel> events = await GetRecentEventsAsync(dayStart, dayEnd, ct);

            int staffOnDuty = staff.Doctors.OnDuty + staff.Nurses.OnDuty + staff.Technicians.OnDuty + staff.Admin.OnDuty;
            int staffTotal = staff.Doctors.Total + staff.Nurses.Total + staff.Technicians.Total + staff.Admin.Total;

            OperationalStatusViewModel status = new(
                alerts.Critical.Count > 0 ? "degraded" : "operational",
                UtilizationOf(beds, "er", "emergency"),
                UtilizationOf(beds, "icu", "intensive"),
                orActive,
                orTotal,
                alerts.Critical.Count,
                alerts.Warning.Count,
                staffOnDuty,
                staffTotal,
                financial.Revenue.Today,
                financial.Revenue.Target,
                shiftLabel
            );

            return new DashboardOverviewViewModel(status, patientFlow, departmentLoad, alerts, beds, operations, financial, appointments, staff, events);
        }

        #region Helpers
        private static string ShiftLabel(string? shift, DateTime now)
        {
            string key = shift?.ToLowerInvariant() ?? (now.Hour is >= 6 and < 14 ? "morning" : now.Hour is >= 14 and < 22 ? "afternoon" : "night");
            return key switch
            {
                "morning" => "Morning shift · 06:00–14:00",
                "afternoon" => "Afternoon shift · 14:00–22:00",
                _ => "Night shift · 22:00–06:00"
            };
        }

        /// <summary>Occupancy % of the wards whose name matches any keyword (ER, ICU), 0 when there are none.</summary>
        private static double UtilizationOf(IEnumerable<WardOccupancyViewModel> wards, params string[] keywords)
        {
            List<WardOccupancyViewModel> matches = wards
                .Where(w => keywords.Any(k => MatchesKeyword(w.Name, k)))
                .ToList();
            int total = matches.Sum(w => w.Total);
            return total == 0 ? 0 : Math.Round(matches.Sum(w => w.Occupied) * 100.0 / total, 1);
        }

        // Short keywords (ER, ICU) must be whole words so "Gen Ward" doesn't count as ER; long ones may be substrings.
        private static bool MatchesKeyword(string name, string keyword) =>
            keyword.Length <= 3
                ? name.Split(' ', '-', '_', '/').Any(part => part.Equals(keyword, StringComparison.OrdinalIgnoreCase))
                : name.Contains(keyword, StringComparison.OrdinalIgnoreCase);

        private static double Pct(double value, double total) => total == 0 ? 0 : Math.Round(value * 100.0 / total, 1);

        private static double ChangePct(double current, double previous) =>
            previous == 0 ? (current > 0 ? 100 : 0) : Math.Round((current - previous) * 100.0 / previous, 1);

        private static string Time(DateTime at) => at.ToString("HH:mm");
        #endregion
    }
}
