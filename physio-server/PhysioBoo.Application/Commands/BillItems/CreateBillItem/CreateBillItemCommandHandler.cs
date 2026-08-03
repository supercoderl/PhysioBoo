using MediatR;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.BillItems.CreateBillItem
{
    public sealed class CreateBillItemCommandHandler : CommandHandlerBase, IRequestHandler<CreateBillItemCommand>
    {
        private readonly IBillItemRepository _billItemRepository;
        private readonly IUser _user;

        public CreateBillItemCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IBillItemRepository billItemRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _billItemRepository = billItemRepository;
            _user = user;
        }

        public async Task Handle(CreateBillItemCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            BillItem newBillItem = new BillItem(
                request.NewBillItem.Id,
                request.NewBillItem.BillId,
                request.NewBillItem.Type,
                request.NewBillItem.ItemCode,
                request.NewBillItem.ItemName,
                request.NewBillItem.Description,
                request.NewBillItem.UnitPrice,
                request.NewBillItem.TotalAmount,
                request.NewBillItem.PerformedBy,
                request.NewBillItem.PerformedDate,
                request.NewBillItem.ReferenceId
            );

            newBillItem.SetTenantId(_user.GetTenantId());
            newBillItem.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _billItemRepository.InsertAsync<BillItem, Guid>(newBillItem);

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));

                return;
            }
        }
    }
}
