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

        public CreateBillItemCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IBillItemRepository billItemRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _billItemRepository = billItemRepository;
        }

        public async Task Handle(CreateBillItemCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var result = await _billItemRepository.InsertAsync<BillItem, Guid>(new BillItem(
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
            ));

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
