using MediatR;
using PhysioBoo.Application.Interfaces;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Patients.InvitePatient
{
    public sealed class InvitePatientToPortalCommandHandler : CommandHandlerBase, IRequestHandler<InvitePatientToPortalCommand>
    {
        private readonly IUserRepository _userRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IUserProvisioningService _userProvisioningService;
        private readonly IUser _user;

        public InvitePatientToPortalCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IUserRepository userRepository,
            IPatientRepository patientRepository,
            IUserProvisioningService userProvisioningService,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _userRepository = userRepository;
            _patientRepository = patientRepository;
            _userProvisioningService = userProvisioningService;
            _user = user;
        }

        public async Task Handle(InvitePatientToPortalCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.PatientInformation.Patient? patient = await _patientRepository.GetByIdAsync(request.PatientId, includeProperties: "Profile");
            if (patient == null)
            {
                await NotifyAsync(request.MessageType,
                    $"Patient with ID {request.PatientId} not found.",
                    ErrorCodes.ObjectNotFound
                );
                return;
            }

            User newUser = await _userProvisioningService.BuildAsync(
                Guid.NewGuid(),
                new ViewModels.Users.CreateUserViewModel(
                    "",
                    "",
                    Guid.NewGuid().ToString(),
                    Domain.Enums.Role.PATIENT
                ),
                patient.Profile,
                _user.GetUserId()
            );

            SharedKernel.Results.DbResult<Guid> result = await _userRepository.InsertAsync<User, Guid>(newUser);

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));

                return;
            }

            patient.SetUserId(newUser.Id);
            await _patientRepository.UpdateTrackedAsync(patient, ct);
        }
    }
}