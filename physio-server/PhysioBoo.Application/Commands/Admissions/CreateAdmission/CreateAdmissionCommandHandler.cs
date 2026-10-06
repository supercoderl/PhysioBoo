using PhysioBoo.Application.Commands.BedMap;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Admissions.CreateAdmission
{
    public sealed class CreateAdmissionCommandHandler : CommandHandlerBase, IRequestHandler<CreateAdmissionCommand>
    {
        private readonly IAdmissionRepository _admissionRepository;
        private readonly IBedRepository _bedRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IDepartmentRepository _departmentRepository;
        private readonly IDoctorRepository _doctorRepository;
        private readonly ISys_SequenceTrackerRepository _sequenceTrackerRepository;
        private readonly IUser _user;

        public CreateAdmissionCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IAdmissionRepository admissionRepository,
            IBedRepository bedRepository,
            IPatientRepository patientRepository,
            IDepartmentRepository departmentRepository,
            IDoctorRepository doctorRepository,
            ISys_SequenceTrackerRepository sequenceTrackerRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _admissionRepository = admissionRepository;
            _bedRepository = bedRepository;
            _patientRepository = patientRepository;
            _departmentRepository = departmentRepository;
            _doctorRepository = doctorRepository;
            _sequenceTrackerRepository = sequenceTrackerRepository;
            _user = user;
        }

        public async Task Handle(CreateAdmissionCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var vm = request.NewAdmission;

            if (!await _patientRepository.ExistsAsync(vm.PatientId, cancellationToken))
            {
                await NotFoundAsync(request, "Patient", vm.PatientId);
                return;
            }

            if (!await _departmentRepository.ExistsAsync(vm.DepartmentId, cancellationToken))
            {
                await NotFoundAsync(request, "Department", vm.DepartmentId);
                return;
            }

            if (!await _doctorRepository.ExistsAsync(vm.DoctorId, cancellationToken))
            {
                await NotFoundAsync(request, "Doctor", vm.DoctorId);
                return;
            }

            if (await _admissionRepository.ExistsAsync(a => a.PatientId == vm.PatientId && a.Status == AdmissionRecordStatus.Admitted, cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "This patient is already admitted.",
                    DomainErrorCodes.Admission.AlreadyAdmitted
                ));
                return;
            }

            // Generate the number before any transaction: the generator opens its own.
            string admissionNumber = await _sequenceTrackerRepository.GenerateNextCodeAsync(nameof(Admission), cancellationToken);

            Admission newAdmission = new Admission(
                request.NewId,
                admissionNumber,
                vm.PatientId,
                Enum.Parse<AdmissionType>(vm.AdmissionType, true),
                vm.AdmittedAt,
                vm.DepartmentId,
                vm.DoctorId,
                Clean(vm.ReferredBy),
                vm.ChiefComplaint.Trim(),
                vm.ProvisionalDiagnosis.Trim(),
                Clean(vm.Allergies),
                Clean(vm.CurrentMedications),
                Clean(vm.MedicalHistory),
                vm.HasInsurance,
                vm.HasInsurance ? Clean(vm.InsuranceProvider) : null,
                vm.HasInsurance ? Clean(vm.PolicyNumber) : null
            );

            newAdmission.SetTenantId(_user.GetTenantId());
            newAdmission.SetCreatedBy(_user.GetUserId());

            if (!vm.BedId.HasValue)
            {
                SharedKernel.Results.DbResult<Guid> inserted = await _admissionRepository.InsertAsync<Admission, Guid>(newAdmission);
                if (!inserted.Success)
                {
                    await NotifyAsync(new DomainNotification(
                        request.MessageType,
                        $"Failed to create admission: {inserted.Error}",
                        ErrorCodes.CommitFailed
                    ));
                }
                return;
            }

            // Admission and bed are created together: both succeed or neither does.
            SharedKernel.Results.DbResult<Guid> assigned = await _bedRepository.AssignPatientAsync(
                vm.BedId.Value,
                vm.PatientId,
                newAdmission,
                vm.ExpectedDischargeDate,
                null,
                _user.Name,
                _user.GetTenantId(),
                _user.GetUserId(),
                cancellationToken
            );

            if (!assigned.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    BedOperationErrors.Describe(assigned.Error),
                    assigned.Error ?? ErrorCodes.CommitFailed
                ));
            }
        }

        private async Task NotFoundAsync(CreateAdmissionCommand request, string what, Guid id)
        {
            await NotifyAsync(new DomainNotification(
                request.MessageType,
                $"{what} with id {id} doesn't exist.",
                ErrorCodes.ObjectNotFound
            ));
        }

        private static string? Clean(string? value)
        {
            return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        }
    }
}
