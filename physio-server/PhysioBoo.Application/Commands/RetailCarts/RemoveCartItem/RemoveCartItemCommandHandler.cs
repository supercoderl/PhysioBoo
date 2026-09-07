
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.RetailCarts.RemoveCartItem
{
    public sealed class RemoveCartItemCommandHandler : CommandHandlerBase, IRequestHandler<RemoveCartItemCommand>
    {
        private readonly IRetailCartLineItemRepository _retailCartLineItemRepository;

        public RemoveCartItemCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IRetailCartLineItemRepository retailCartLineItemRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _retailCartLineItemRepository = retailCartLineItemRepository;
        }

        public async Task Handle(RemoveCartItemCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            RetailCartLineItem? item = await _retailCartLineItemRepository.GetByIdAsync(request.LineItemId, ct: ct);

            if (item == null || item.RetailCartId != request.CartId)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, "Cart line item not found.", ErrorCodes.ObjectNotFound));
                return;
            }

            _retailCartLineItemRepository.SoftDeleteSingle(item, ct: ct);

            await CommitAsync();
        }
    }
}
