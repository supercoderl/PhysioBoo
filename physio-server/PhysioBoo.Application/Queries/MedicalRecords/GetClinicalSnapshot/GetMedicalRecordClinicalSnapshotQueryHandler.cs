using MediatR;
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.MedicalRecords;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Queries.MedicalRecords.GetClinicalSnapshot
{
    public sealed class GetMedicalRecordClinicalSnapshotQueryHandler : IRequestHandler<GetMedicalRecordClinicalSnapshotQuery, ClinicalSnapshotViewModel?>
    {
        private readonly IPatientMedicalHistoryRepository _patientMedicalHistoryRepository;
        private readonly IPatientAllergyRepository _patientAllergyRepository;
        private readonly ILabOrderRepository _labOrderRepository;
        private readonly ILabOrderItemRepository _labOrderItemRepository;
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IBillRepository _billRepository;
        private readonly IPatientRepository _patientRepository;

        public GetMedicalRecordClinicalSnapshotQueryHandler(
            IPatientMedicalHistoryRepository patientMedicalHistoryRepository,
            IPatientAllergyRepository patientAllergyRepository,
            ILabOrderRepository labOrderRepository,
            ILabOrderItemRepository labOrderItemRepository,
            IAppointmentRepository appointmentRepository,
            IBillRepository billRepository,
            IPatientRepository patientRepository
        )
        {
            _patientMedicalHistoryRepository = patientMedicalHistoryRepository;
            _patientAllergyRepository = patientAllergyRepository;
            _labOrderRepository = labOrderRepository;
            _labOrderItemRepository = labOrderItemRepository;
            _appointmentRepository = appointmentRepository;
            _billRepository = billRepository;
            _patientRepository = patientRepository;
        }

        public async Task<ClinicalSnapshotViewModel?> Handle(GetMedicalRecordClinicalSnapshotQuery request, CancellationToken ct)
        {
            DateOnly today = DateOnly.FromDateTime(TimeZoneHelper.GetLocalTimeNow());
            TimeOnly now = TimeOnly.FromDateTime(TimeZoneHelper.GetLocalTimeNow());
            int activeDiagnosesCount = await _patientMedicalHistoryRepository.CountAsync(new ActiveDiagnosisByPatientSpec(request.PatientId), ct);
            int activeMedicationsCount = 0;
            decimal outstandingBalance = 0;
            string currency = "VND";
            int knownAllergiesCount = await _patientAllergyRepository.CountAsync(new KnownAllergyByPatientSpec(request.PatientId), ct);
            int pendingOrdersCount = await _labOrderRepository.CountAsync(new PendingOrderByPatientSpec(request.PatientId), ct);
            List<Domain.Entities.LaboratoryImaging.LabOrderItem> recentLabAlerts = await _labOrderItemRepository.GetAllNoTracking(
                filter: x => x.LabOrder != null ? x.LabOrder.PatientId == request.PatientId : false,
                includeProperties: "LabOrder"
            ).OrderByDescending(x => x.CreatedAt).ToListAsync();
            List<Domain.Entities.Operation.Appointment> upcomingAppointments = await _appointmentRepository.GetAllNoTracking(
                filter: x => x.PatientId == request.PatientId && x.AppointmentStatus != AppointmentStatus.Cancelled && (x.ScheduledDate > today || (x.ScheduledDate == today && x.ScheduledTime > now))
            ).OrderBy(x => x.ScheduledDate).ThenBy(x => x.ScheduledTime).Take(2).ToListAsync();

            List<Domain.Entities.Operation.Bill> bills = await _billRepository.GetAllNoTracking(
                filter: x => x.PatientId == request.PatientId
            ).ToListAsync();

            if (bills.Any())
            {
                outstandingBalance = bills.Sum(x => x.TotalAmount - x.PaidAmount);
                currency = bills.FirstOrDefault()?.Currency ?? string.Empty;
            }

            return ClinicalSnapshotViewModel.FromEntity(
                activeDiagnosesCount,
                activeMedicationsCount,
                knownAllergiesCount,
                pendingOrdersCount,
                recentLabAlerts.Select(x => ClinicalSnapshotViewModel.RecentLabAlert.FromLab(x)).ToList(),
                upcomingAppointments.Select(x => ClinicalSnapshotViewModel.UpcomingAppointment.FromAppointment(x)).ToList(),
                outstandingBalance,
                currency
            );
        }
    }
}
