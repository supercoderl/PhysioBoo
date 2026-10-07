namespace PhysioBoo.Application.ViewModels.Dashboard
{
    // Mirrors physio-app shared/types/dashboard-overview.types.ts. Lower-case string values
    // (severity, status, category) are part of that contract.

    public sealed record OperationalStatusViewModel(
        string SystemStatus,
        double ErUtilizationPct,
        double IcuUtilizationPct,
        int OrActive,
        int OrTotal,
        int CriticalAlertCount,
        int WarningAlertCount,
        int StaffOnDuty,
        int StaffTotal,
        decimal RevenueToday,
        decimal RevenueTarget,
        string ShiftLabel
    );

    public sealed record PatientFlowHourlyPointViewModel(string Hour, int Admissions, int Discharges);

    public sealed record PatientFlowSummaryViewModel(
        int AdmissionsToday,
        double AdmissionsTrendPct,
        int DischargesToday,
        int DischargesPending,
        double AvgLengthOfStayDays,
        double BedTurnoverRate,
        double BedTurnoverTrendPct,
        List<PatientFlowHourlyPointViewModel> Hourly
    );

    public sealed record DepartmentLoadViewModel(string Name, double UtilizationPct, bool IsCritical);

    public sealed record DashboardAlertItemViewModel(string Id, string Department, string Message, string OccurredAt, string Severity);

    public sealed record DashboardAlertsViewModel(
        List<DashboardAlertItemViewModel> Critical,
        List<DashboardAlertItemViewModel> Warning,
        List<DashboardAlertItemViewModel> Info
    );

    public sealed record WardOccupancyViewModel(string Name, int Occupied, int Total);

    public sealed record OperationTheatreViewModel(
        string Room,
        string Procedure,
        string Surgeon,
        string StartedAt,
        int EtaMinutes,
        string Status,
        int ProgressPct
    );

    public sealed record RevenueSnapshotViewModel(decimal Today, decimal Target, double ChangePct, List<decimal> Trend);

    public sealed record InsuranceClaimsSnapshotViewModel(int Pending, double ApprovedPct, int CriticalCount, double AvgProcessingDays);

    public sealed record PharmacySnapshotViewModel(int DispensedToday, int Target, int LowStockCount);

    public sealed record LaboratorySnapshotViewModel(int OrdersPending, double AvgTurnaroundHours, int StatOrdersPending);

    public sealed record RadiologySnapshotViewModel(int StudiesInQueue, double AvgReadMinutes, int UrgentReadsPending);

    public sealed record FinancialClinicalSnapshotViewModel(
        RevenueSnapshotViewModel Revenue,
        InsuranceClaimsSnapshotViewModel InsuranceClaims,
        PharmacySnapshotViewModel Pharmacy,
        LaboratorySnapshotViewModel Laboratory,
        RadiologySnapshotViewModel Radiology
    );

    public sealed record AppointmentFlowHourlySlotViewModel(string Hour, int BookedPct);

    public sealed record AppointmentFlowSummaryViewModel(
        int Scheduled,
        int Confirmed,
        int Pending,
        int NoShows,
        int SlotsRemaining,
        List<AppointmentFlowHourlySlotViewModel> Hourly
    );

    public sealed record StaffGroupDutyViewModel(int OnDuty, int Total);

    public sealed record StaffDutySummaryViewModel(
        string ShiftLabel,
        int OnDutyPct,
        StaffGroupDutyViewModel Doctors,
        StaffGroupDutyViewModel Nurses,
        StaffGroupDutyViewModel Technicians,
        StaffGroupDutyViewModel Admin
    );

    public sealed record DashboardEventViewModel(string Id, string Text, string OccurredAt, string Category);

    public sealed record DashboardOverviewViewModel(
        OperationalStatusViewModel Status,
        PatientFlowSummaryViewModel PatientFlow,
        List<DepartmentLoadViewModel> DepartmentLoad,
        DashboardAlertsViewModel Alerts,
        List<WardOccupancyViewModel> BedCapacity,
        List<OperationTheatreViewModel> ActiveOperations,
        FinancialClinicalSnapshotViewModel Financial,
        AppointmentFlowSummaryViewModel AppointmentFlow,
        StaffDutySummaryViewModel StaffDuty,
        List<DashboardEventViewModel> RecentEvents
    );

    public sealed record DismissDashboardAlertViewModel(string? ResolutionNote);

    public sealed record ExportDashboardViewModel(string? Date, string? Shift, string? Format);
}
