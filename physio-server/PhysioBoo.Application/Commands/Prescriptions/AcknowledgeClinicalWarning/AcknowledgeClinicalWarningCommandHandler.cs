
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Prescriptions.AcknowledgeClinicalWarning
{
    public sealed class AcknowledgeClinicalWarningCommandHandler : CommandHandlerBase, IRequestHandler<AcknowledgeClinicalWarningCommand>
    {
        private readonly IPrescriptionClinicalWarningRepository _warningRepository;
        private readonly IUser _user;

        public AcknowledgeClinicalWarningCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IPrescriptionClinicalWarningRepository warningRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _warningRepository = warningRepository;
            _user = user;
        }

        public async Task Handle(AcknowledgeClinicalWarningCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            PrescriptionClinicalWarning? warning = await _warningRepository.GetByIdAsync(request.WarningId, ct: ct);

            if (warning == null)
            {
                await NotifyAsync(new DomainNotification(nameof(AcknowledgeClinicalWarningCommand),
                    $"Clinical warning with id {request.WarningId} doesn't exist.", ErrorCodes.ObjectNotFound));
                return;
            }

            warning.Acknowledge(_user.GetUserId());
            await _warningRepository.UpdateTrackedAsync(warning, ct);
        }
    }
}
