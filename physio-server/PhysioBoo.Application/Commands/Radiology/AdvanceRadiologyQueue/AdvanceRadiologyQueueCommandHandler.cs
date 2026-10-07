using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Radiology.AdvanceRadiologyQueue
{
    public sealed class AdvanceRadiologyQueueCommandHandler : CommandHandlerBase, IRequestHandler<AdvanceRadiologyQueueCommand>
    {
        private readonly IImagingOrderRepository _imagingOrderRepository;
        private readonly IUser _user;

        public AdvanceRadiologyQueueCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IImagingOrderRepository imagingOrderRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _imagingOrderRepository = imagingOrderRepository;
            _user = user;
        }

        public async Task Handle(AdvanceRadiologyQueueCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            ImagingOrder? order = await _imagingOrderRepository.GetAll(o => o.Id == request.Id).AsTracking().FirstOrDefaultAsync(cancellationToken);
            if (order == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Imaging order with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            if (order.IsCancelled)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "This imaging order is cancelled.",
                    DomainErrorCodes.RadiologyWorkspace.OrderCancelled
                ));
                return;
            }

            RadiologyQueueStatus status = Enum.Parse<RadiologyQueueStatus>(request.Body.Status!, true);
            order.AdvanceQueue(status, TimeZoneHelper.GetLocalTimeNow());

            order.SetUpdatedBy(_user.GetUserId());
            await CommitAsync();
        }
    }
}
