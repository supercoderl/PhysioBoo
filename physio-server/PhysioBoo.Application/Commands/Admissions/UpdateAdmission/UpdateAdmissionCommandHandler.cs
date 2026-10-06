using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Admissions.UpdateAdmission
{
    public sealed class UpdateAdmissionCommandHandler : CommandHandlerBase, IRequestHandler<UpdateAdmissionCommand>
    {
        private readonly IAdmissionRepository _admissionRepository;
        private readonly IDepartmentRepository _departmentRepository;
        private readonly IDoctorRepository _doctorRepository;
        private readonly IUser _user;

        public UpdateAdmissionCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IAdmissionRepository admissionRepository,
            IDepartmentRepository departmentRepository,
            IDoctorRepository doctorRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _admissionRepository = admissionRepository;
            _departmentRepository = departmentRepository;
            _doctorRepository = doctorRepository;
            _user = user;
        }

        public async Task Handle(UpdateAdmissionCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var vm = request.Admission;

            Domain.Entities.Inpatient.Admission? admission = await _admissionRepository.GetByIdAsync(request.Id, ct: cancellationToken);
            if (admission == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Admission with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            if (!await _departmentRepository.ExistsAsync(vm.DepartmentId, cancellationToken) ||
                !await _doctorRepository.ExistsAsync(vm.DoctorId, cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Department or doctor doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            AdmissionType type = Enum.Parse<AdmissionType>(vm.AdmissionType, true);
            Guid? userId = _user.GetUserId();
            DateTime? now = TimeZoneHelper.GetLocalTimeNow();
            string? referredBy = Clean(vm.ReferredBy);
            string chiefComplaint = vm.ChiefComplaint.Trim();
            string provisionalDiagnosis = vm.ProvisionalDiagnosis.Trim();
            string? allergies = Clean(vm.Allergies);
            string? medications = Clean(vm.CurrentMedications);
            string? history = Clean(vm.MedicalHistory);
            string? insuranceProvider = vm.HasInsurance ? Clean(vm.InsuranceProvider) : null;
            string? policyNumber = vm.HasInsurance ? Clean(vm.PolicyNumber) : null;

            // Only while the patient is still admitted, and only the columns this command owns: a whole-row
            // update could undo a discharge made at the same moment.
            int updated = await _admissionRepository.BatchUpdateMultipleAsync(
                a => a.Id == request.Id && a.Status == AdmissionRecordStatus.Admitted,
                s => s
                    .SetProperty(a => a.AdmissionType, type)
                    .SetProperty(a => a.DepartmentId, vm.DepartmentId)
                    .SetProperty(a => a.DoctorId, vm.DoctorId)
                    .SetProperty(a => a.ReferredBy, referredBy)
                    .SetProperty(a => a.ChiefComplaint, chiefComplaint)
                    .SetProperty(a => a.ProvisionalDiagnosis, provisionalDiagnosis)
                    .SetProperty(a => a.Allergies, allergies)
                    .SetProperty(a => a.CurrentMedications, medications)
                    .SetProperty(a => a.MedicalHistory, history)
                    .SetProperty(a => a.HasInsurance, vm.HasInsurance)
                    .SetProperty(a => a.InsuranceProvider, insuranceProvider)
                    .SetProperty(a => a.PolicyNumber, policyNumber)
                    .SetProperty(a => a.UpdatedBy, userId)
                    .SetProperty(a => a.UpdatedAt, now),
                cancellationToken
            );

            if (updated == 0)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Only an active admission can be edited.",
                    DomainErrorCodes.Admission.NotAdmitted
                ));
            }
        }

        private static string? Clean(string? value)
        {
            return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        }
    }
}
