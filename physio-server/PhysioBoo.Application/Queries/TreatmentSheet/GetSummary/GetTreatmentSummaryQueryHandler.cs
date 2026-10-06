using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Queries.Admissions;
using PhysioBoo.Application.ViewModels.TreatmentSheet;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.TreatmentSheet.GetSummary
{
    public sealed class GetTreatmentSummaryQueryHandler : IRequestHandler<GetTreatmentSummaryQuery, TreatmentPatientSummaryViewModel?>
    {
        private static readonly char[] AllergySeparators = { ',', ';', '\n' };

        private readonly IAdmissionRepository _admissionRepository;
        private readonly IBedAssignmentRepository _bedAssignmentRepository;
        private readonly IMediatorHandler _bus;

        public GetTreatmentSummaryQueryHandler(
            IAdmissionRepository admissionRepository,
            IBedAssignmentRepository bedAssignmentRepository,
            IMediatorHandler bus
        )
        {
            _admissionRepository = admissionRepository;
            _bedAssignmentRepository = bedAssignmentRepository;
            _bus = bus;
        }

        public async Task<TreatmentPatientSummaryViewModel?> Handle(GetTreatmentSummaryQuery request, CancellationToken cancellationToken)
        {
            Admission? admission = await _admissionRepository
                .GetAllNoTracking(
                    a => a.PatientId == request.PatientId && a.Status == AdmissionRecordStatus.Admitted,
                    includeProperties: "Patient.Profile,Department,Doctor.User.Profile")
                .FirstOrDefaultAsync(cancellationToken);

            if (admission == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetTreatmentSummaryQuery),
                    $"Patient with id {request.PatientId} has no active admission.",
                    ErrorCodes.ObjectNotFound
                ));
                return null;
            }

            Dictionary<Guid, BedAssignment> stays = await OpenStayLoader.LoadAsync(
                _bedAssignmentRepository, new[] { admission.Id }, cancellationToken);
            Bed? bed = stays.GetValueOrDefault(admission.Id)?.Bed;

            return new TreatmentPatientSummaryViewModel
            {
                PatientId = admission.PatientId,
                FullName = admission.Patient?.Profile?.FullName ?? string.Empty,
                AvatarUrl = null,
                Mrn = admission.Patient?.PatientNumber ?? string.Empty,
                VisitNumber = admission.AdmissionNumber,
                BedNumber = bed?.Number ?? string.Empty,
                WardName = bed?.Ward?.Name ?? string.Empty,
                DepartmentName = admission.Department?.Name ?? string.Empty,
                AdmissionDate = admission.AdmittedAt,
                PrimaryDiagnosis = admission.ProvisionalDiagnosis,
                Allergies = (admission.Allergies ?? string.Empty)
                    .Split(AllergySeparators, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                    .ToList(),
                IsolationStatus = bed?.BedType == BedType.Isolation ? "Isolation room"
                    : bed?.IsolationRequired == true ? "Precautions required"
                    : null,
                AttendingDoctorName = admission.Doctor?.User?.Profile?.FullName ?? string.Empty
            };
        }
    }
}
