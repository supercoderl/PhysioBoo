using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Laboratory.ApproveLabResult
{
    public sealed class ApproveLabResultCommandHandler : CommandHandlerBase, IRequestHandler<ApproveLabResultCommand>
    {
        private readonly ILabOrderItemRepository _labOrderItemRepository;
        private readonly IUser _user;

        public ApproveLabResultCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ILabOrderItemRepository labOrderItemRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _labOrderItemRepository = labOrderItemRepository;
            _user = user;
        }

        public async Task Handle(ApproveLabResultCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            LabOrderItem? item = await LabWorkflow.LoadItemAsync(_labOrderItemRepository, request.Id, cancellationToken);
            if (item == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Lab test with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            if (string.IsNullOrWhiteSpace(item.ResultValue))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Enter a result value before approving it.",
                    DomainErrorCodes.LabWorkspace.NoResultValue
                ));
                return;
            }

            item.Approve(_user.GetUserId(), TimeZoneHelper.GetLocalTimeNow());

            // When every test of the order is verified, the report is ready.
            LabOrder? order = item.LabOrder;
            if (order != null)
            {
                bool othersVerified = !await _labOrderItemRepository.ExistsAsync(
                    i => i.LabOrderId == order.Id && i.Id != item.Id && i.VerificationStatus != LabVerificationStatus.Verified,
                    cancellationToken);
                if (othersVerified) order.SetOrderStatus(OrderStatus.ReportReady);
            }

            item.SetUpdatedBy(_user.GetUserId());
            await CommitAsync();
        }
    }
}
