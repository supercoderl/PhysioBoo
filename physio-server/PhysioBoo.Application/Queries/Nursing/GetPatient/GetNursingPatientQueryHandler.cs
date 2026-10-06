using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Nursing;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Nursing.GetPatient
{
    public sealed class GetNursingPatientQueryHandler : IRequestHandler<GetNursingPatientQuery, NursingPatientViewModel?>
    {
        private readonly IAdmissionRepository _admissionRepository;
        private readonly INursingAssignmentRepository _assignmentRepository;
        private readonly IBedAssignmentRepository _bedAssignmentRepository;
        private readonly INursingTaskRepository _taskRepository;
        private readonly IMedicationAdministrationRepository _medicationRepository;
        private readonly IVitalSignRepository _vitalSignRepository;
        private readonly IMediatorHandler _bus;

        public GetNursingPatientQueryHandler(
            IAdmissionRepository admissionRepository,
            INursingAssignmentRepository assignmentRepository,
            IBedAssignmentRepository bedAssignmentRepository,
            INursingTaskRepository taskRepository,
            IMedicationAdministrationRepository medicationRepository,
            IVitalSignRepository vitalSignRepository,
            IMediatorHandler bus
        )
        {
            _admissionRepository = admissionRepository;
            _assignmentRepository = assignmentRepository;
            _bedAssignmentRepository = bedAssignmentRepository;
            _taskRepository = taskRepository;
            _medicationRepository = medicationRepository;
            _vitalSignRepository = vitalSignRepository;
            _bus = bus;
        }

        public async Task<NursingPatientViewModel?> Handle(GetNursingPatientQuery request, CancellationToken cancellationToken)
        {
            Admission? admission = await _admissionRepository
                .GetAllNoTracking(
                    a => a.PatientId == request.PatientId && a.Status == AdmissionRecordStatus.Admitted,
                    includeProperties: "Patient.Profile,Doctor.User.Profile")
                .FirstOrDefaultAsync(cancellationToken);

            if (admission == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetNursingPatientQuery),
                    $"Patient with id {request.PatientId} has no active admission.",
                    ErrorCodes.ObjectNotFound
                ));
                return null;
            }

            // Latest nursing assessment for this stay, from whichever nurse made it.
            NursingAssignment? assignment = await _assignmentRepository
                .GetAllNoTracking(a => a.AdmissionId == admission.Id)
                .OrderByDescending(a => a.ShiftDate)
                .ThenByDescending(a => a.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);

            NursingPatientSource source = new NursingPatientSource(
                assignment?.Id ?? admission.Id,
                admission,
                assignment?.Acuity ?? AcuityLevel.Low,
                assignment?.FallRisk ?? false
            );

            List<NursingPatientViewModel> built = await NursingPatientBuilder.BuildAsync(
                new[] { source },
                _bedAssignmentRepository,
                _taskRepository,
                _medicationRepository,
                _vitalSignRepository,
                TimeZoneHelper.GetLocalTimeNow(),
                cancellationToken);

            return built.FirstOrDefault();
        }
    }
}
