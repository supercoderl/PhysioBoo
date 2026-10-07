using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Laboratory.RejectLabSample
{
    public sealed class RejectLabSampleCommandHandler : CommandHandlerBase, IRequestHandler<RejectLabSampleCommand>
    {
        private readonly ILabOrderItemRepository _labOrderItemRepository;
        private readonly ILabAlertRepository _labAlertRepository;
        private readonly IUser _user;

        public RejectLabSampleCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ILabOrderItemRepository labOrderItemRepository,
            ILabAlertRepository labAlertRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _labOrderItemRepository = labOrderItemRepository;
            _labAlertRepository = labAlertRepository;
            _user = user;
        }

        public async Task Handle(RejectLabSampleCommand request, CancellationToken cancellationToken)
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

            string reason = request.Body.Reason!.Trim();
            item.RejectSample(reason);

            await LabWorkflow.RaiseAlertAsync(
                _labAlertRepository, _user, item,
                LabAlertType.SampleRejected, LabAlertSeverity.Warning,
                $"Sample for {item.TestName} rejected: {reason}",
                "Request a new sample from the ward and notify the ordering doctor.");

            item.SetUpdatedBy(_user.GetUserId());
            await CommitAsync();
        }
    }
}
