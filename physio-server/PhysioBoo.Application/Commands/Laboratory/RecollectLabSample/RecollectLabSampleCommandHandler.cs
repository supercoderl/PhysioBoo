using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Laboratory.RecollectLabSample
{
    public sealed class RecollectLabSampleCommandHandler : CommandHandlerBase, IRequestHandler<RecollectLabSampleCommand>
    {
        private readonly ILabOrderItemRepository _labOrderItemRepository;
        private readonly IUser _user;

        public RecollectLabSampleCommandHandler(
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

        public async Task Handle(RecollectLabSampleCommand request, CancellationToken cancellationToken)
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

            if (item.VerificationStatus == LabVerificationStatus.Verified)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "The result for this sample is already verified.",
                    DomainErrorCodes.LabWorkspace.AlreadyVerified
                ));
                return;
            }

            item.RequestRecollection(request.Body.Reason!.Trim());

            item.SetUpdatedBy(_user.GetUserId());
            await CommitAsync();
        }
    }
}
