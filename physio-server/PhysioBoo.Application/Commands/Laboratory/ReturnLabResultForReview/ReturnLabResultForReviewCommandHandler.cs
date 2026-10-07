using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Laboratory.ReturnLabResultForReview
{
    public sealed class ReturnLabResultForReviewCommandHandler : CommandHandlerBase, IRequestHandler<ReturnLabResultForReviewCommand>
    {
        private readonly ILabOrderItemRepository _labOrderItemRepository;
        private readonly IUser _user;

        public ReturnLabResultForReviewCommandHandler(
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

        public async Task Handle(ReturnLabResultForReviewCommand request, CancellationToken cancellationToken)
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
                    "There is no result to return for review.",
                    DomainErrorCodes.LabWorkspace.NoResultValue
                ));
                return;
            }

            item.ReturnForReview(request.Body.Reason!.Trim());

            item.SetUpdatedBy(_user.GetUserId());
            await CommitAsync();
        }
    }
}
