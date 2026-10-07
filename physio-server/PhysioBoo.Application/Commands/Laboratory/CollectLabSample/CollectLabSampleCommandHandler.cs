using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Laboratory.CollectLabSample
{
    public sealed class CollectLabSampleCommandHandler : CommandHandlerBase, IRequestHandler<CollectLabSampleCommand>
    {
        private readonly ILabOrderItemRepository _labOrderItemRepository;
        private readonly IUser _user;

        public CollectLabSampleCommandHandler(
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

        public async Task Handle(CollectLabSampleCommand request, CancellationToken cancellationToken)
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

            DateTime now = TimeZoneHelper.GetLocalTimeNow();
            string collector = string.IsNullOrWhiteSpace(request.Body.CollectorName) ? _user.Name : request.Body.CollectorName.Trim();

            item.MarkCollected(_user.GetUserId(), collector, request.Body.ContainerType?.Trim(), now);
            if (item.Barcode == null)
                item.SetBarcode(Queries.Laboratory.LabWorkspace.Barcode(item));

            item.SetUpdatedBy(_user.GetUserId());
            await CommitAsync();
        }
    }
}
