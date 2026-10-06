using PhysioBoo.Application.ViewModels.TreatmentSheet;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.TreatmentSheet.UpdateOrderStatus
{
    public sealed class UpdateTreatmentOrderStatusCommandHandler : CommandHandlerBase, IRequestHandler<UpdateTreatmentOrderStatusCommand>
    {
        private readonly ITreatmentOrderRepository _orderRepository;
        private readonly IUser _user;

        public UpdateTreatmentOrderStatusCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ITreatmentOrderRepository orderRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _orderRepository = orderRepository;
            _user = user;
        }

        public async Task Handle(UpdateTreatmentOrderStatusCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            TreatmentOrder? order = await _orderRepository.GetByIdAsync(request.OrderId, ct: cancellationToken);
            if (order == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Order with id {request.OrderId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            TreatmentOrderStatus status = Enum.Parse<TreatmentOrderStatus>(request.Input.Status, true);
            Guid? userId = _user.GetUserId();
            DateTime? updatedAt = TimeZoneHelper.GetLocalTimeNow();

            // Only the status column: a whole-row update could overwrite an edit made at the same moment.
            await _orderRepository.BatchUpdateMultipleAsync(
                o => o.Id == request.OrderId,
                s => s
                    .SetProperty(o => o.Status, status)
                    .SetProperty(o => o.UpdatedBy, userId)
                    .SetProperty(o => o.UpdatedAt, updatedAt),
                cancellationToken
            );

            order.SetStatus(status);
            request.Result = TreatmentOrderViewModel.FromEntity(order);
        }
    }
}
