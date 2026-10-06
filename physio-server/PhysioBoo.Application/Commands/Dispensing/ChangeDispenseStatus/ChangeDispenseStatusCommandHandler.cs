using PhysioBoo.Domain.Entities.Clinical;

namespace PhysioBoo.Application.Commands.Dispensing.ChangeDispenseStatus
{
    public sealed class ChangeDispenseStatusCommandHandler : CommandHandlerBase, IRequestHandler<ChangeDispenseStatusCommand>
    {
        private readonly DispenseSessionLoader _loader;

        public ChangeDispenseStatusCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            DispenseSessionLoader loader
        ) : base(bus, unitOfWork, notifications)
        {
            _loader = loader;
        }

        public async Task Handle(ChangeDispenseStatusCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            (DispenseContext? context, string? error, string? code) = await _loader.LoadAsync(request.PrescriptionId, ct);
            if (context == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, error!, code!));
                return;
            }

            string reason = request.Reason.Trim();

            if (request.Action == DispenseSessionAction.Hold)
            {
                // Reservations are kept so the stock is still there when the pharmacist resumes.
                context.Session.Hold(reason);
            }
            else
            {
                foreach (DispenseSessionItem item in context.Session.Items)
                {
                    await _loader.ReleaseReservationAsync(item, ct);
                }

                context.Session.Cancel(reason);
                context.Prescription.Cancel(reason);
            }

            await CommitAsync();
        }
    }
}
