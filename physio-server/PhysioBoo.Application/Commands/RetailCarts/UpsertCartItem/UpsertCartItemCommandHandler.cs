
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.RetailCarts.UpsertCartItem
{
    public sealed class UpsertCartItemCommandHandler : CommandHandlerBase, IRequestHandler<UpsertCartItemCommand>
    {
        private readonly IRetailCartRepository _retailCartRepository;
        private readonly IRetailCartLineItemRepository _retailCartLineItemRepository;
        private readonly IMedicineRepository _medicineRepository;
        private readonly IUser _user;

        public UpsertCartItemCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IRetailCartRepository retailCartRepository,
            IRetailCartLineItemRepository retailCartLineItemRepository,
            IMedicineRepository medicineRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _retailCartRepository = retailCartRepository;
            _retailCartLineItemRepository = retailCartLineItemRepository;
            _medicineRepository = medicineRepository;
            _user = user;
        }

        public async Task Handle(UpsertCartItemCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            RetailCart? cart = await _retailCartRepository.GetByIdAsync(request.CartId, includeProperties: "RetailCartLineItems", ct: ct);

            if (cart == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Cart {request.CartId} not found.", ErrorCodes.ObjectNotFound));
                return;
            }

            RetailCartLineItem? existing = cart.RetailCartLineItems.FirstOrDefault(i => i.MedicineId == request.MedicineId);

            if (existing != null)
            {
                existing.SetQuantity(request.Item.Quantity);
                existing.SetDiscountPercent(request.Item.DiscountPercent);
                await _retailCartLineItemRepository.UpdateTrackedAsync(existing, ct);
                return;
            }

            Domain.Entities.Clinical.Medicine? medicine = await _medicineRepository.GetByIdAsync(request.MedicineId, ct: ct);

            if (medicine == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Medicine {request.MedicineId} not found.", ErrorCodes.ObjectNotFound));
                return;
            }

            RetailCartLineItem newItem = new RetailCartLineItem(
                Guid.NewGuid(),
                request.CartId,
                request.MedicineId,
                request.Item.Quantity,
                medicine.SellingPrice ?? 0,
                request.Item.DiscountPercent,
                0
            );

            newItem.SetTenantId(_user.GetTenantId());
            newItem.SetCreatedBy(_user.GetUserId());

            await _retailCartLineItemRepository.InsertAsync(newItem);
        }
    }
}
