using PhysioBoo.Application.ViewModels.Nursing;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Nursing.GetAssignments
{
    public sealed class GetNursingAssignmentsQueryHandler : IRequestHandler<GetNursingAssignmentsQuery, List<NursingPatientViewModel>>
    {
        private readonly INursingAssignmentRepository _assignmentRepository;
        private readonly IBedAssignmentRepository _bedAssignmentRepository;
        private readonly INursingTaskRepository _taskRepository;
        private readonly IMedicationAdministrationRepository _medicationRepository;
        private readonly IVitalSignRepository _vitalSignRepository;
        private readonly IUser _user;

        public GetNursingAssignmentsQueryHandler(
            INursingAssignmentRepository assignmentRepository,
            IBedAssignmentRepository bedAssignmentRepository,
            INursingTaskRepository taskRepository,
            IMedicationAdministrationRepository medicationRepository,
            IVitalSignRepository vitalSignRepository,
            IUser user
        )
        {
            _assignmentRepository = assignmentRepository;
            _bedAssignmentRepository = bedAssignmentRepository;
            _taskRepository = taskRepository;
            _medicationRepository = medicationRepository;
            _vitalSignRepository = vitalSignRepository;
            _user = user;
        }

        public async Task<List<NursingPatientViewModel>> Handle(GetNursingAssignmentsQuery request, CancellationToken cancellationToken)
        {
            DateTime now = TimeZoneHelper.GetLocalTimeNow();

            List<NursingAssignment> assignments = await NursingScope.GetMyAssignmentsAsync(
                _assignmentRepository,
                _user.GetUserId(),
                request.Shift,
                now,
                "Admission.Patient.Profile,Admission.Doctor.User.Profile",
                cancellationToken);

            List<NursingPatientSource> sources = assignments
                .Select(a => new NursingPatientSource(a.Id, a.Admission!, a.Acuity, a.FallRisk))
                .ToList();

            List<NursingPatientViewModel> patients = await NursingPatientBuilder.BuildAsync(
                sources,
                _bedAssignmentRepository,
                _taskRepository,
                _medicationRepository,
                _vitalSignRepository,
                now,
                cancellationToken);

            if (request.WardId.HasValue)
            {
                patients = patients.Where(p => p.WardId == request.WardId.Value).ToList();
            }

            // Sickest first, then by bed.
            return patients
                .OrderByDescending(p => Enum.Parse<AcuityLevel>(p.Acuity))
                .ThenBy(p => p.BedNumber)
                .ToList();
        }
    }
}
