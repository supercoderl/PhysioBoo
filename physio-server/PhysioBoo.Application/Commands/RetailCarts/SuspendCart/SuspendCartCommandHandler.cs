
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.RetailCarts.SuspendCart
{
    public sealed class SuspendCartCommandHandler : CommandHandlerBase, IRequestHandler<SuspendCartCommand>
    {
        private readonly IRetailCartRepository _retailCartRepository;

        public SuspendCartCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IRetailCartRepository retailCartRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _retailCartRepository = retailCartRepository;
        }

        public async Task Handle(SuspendCartCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            RetailCart? cart = await _retailCartRepository.GetByIdAsync(request.CartId, ct: ct);

            if (cart == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Cart {request.CartId} not found.", ErrorCodes.ObjectNotFound));
                return;
            }

            cart.Suspend();
            await _retailCartRepository.UpdateTrackedAsync(cart, ct);
        }
    }
}
