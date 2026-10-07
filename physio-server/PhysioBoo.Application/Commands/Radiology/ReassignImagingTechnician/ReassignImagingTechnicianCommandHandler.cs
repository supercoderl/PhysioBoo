using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Radiology.ReassignImagingTechnician
{
    public sealed class ReassignImagingTechnicianCommandHandler : CommandHandlerBase, IRequestHandler<ReassignImagingTechnicianCommand>
    {
        private readonly IImagingOrderRepository _imagingOrderRepository;
        private readonly IUser _user;

        public ReassignImagingTechnicianCommandHandler(
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

        public async Task Handle(ReassignImagingTechnicianCommand request, CancellationToken cancellationToken)
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

            order.SetTechnicianName(request.Body.TechnicianName!.Trim());

            order.SetUpdatedBy(_user.GetUserId());
            await CommitAsync();
        }
    }
}
