using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Radiology.CancelImagingSlot
{
    public sealed class CancelImagingSlotCommandHandler : CommandHandlerBase, IRequestHandler<CancelImagingSlotCommand>
    {
        private readonly IImagingOrderRepository _imagingOrderRepository;
        private readonly IUser _user;

        public CancelImagingSlotCommandHandler(
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

        public async Task Handle(CancelImagingSlotCommand request, CancellationToken cancellationToken)
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

            if (order.IsCancelled) return;

            order.Cancel(request.Body.Reason!.Trim());

            order.SetUpdatedBy(_user.GetUserId());
            await CommitAsync();
        }
    }
}
