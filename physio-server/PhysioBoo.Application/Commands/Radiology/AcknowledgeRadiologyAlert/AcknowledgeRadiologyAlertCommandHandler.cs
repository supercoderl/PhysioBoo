using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Radiology.AcknowledgeRadiologyAlert
{
    public sealed class AcknowledgeRadiologyAlertCommandHandler : CommandHandlerBase, IRequestHandler<AcknowledgeRadiologyAlertCommand>
    {
        private readonly IRadiologyAlertRepository _radiologyAlertRepository;
        private readonly IUser _user;

        public AcknowledgeRadiologyAlertCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IRadiologyAlertRepository radiologyAlertRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _radiologyAlertRepository = radiologyAlertRepository;
            _user = user;
        }

        public async Task Handle(AcknowledgeRadiologyAlertCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            RadiologyAlert? alert = await _radiologyAlertRepository.GetAll(a => a.Id == request.Id).AsTracking().FirstOrDefaultAsync(cancellationToken);
            if (alert == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Radiology alert with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            if (alert.Acknowledged) return;

            alert.Acknowledge(_user.GetUserId(), TimeZoneHelper.GetLocalTimeNow());
            alert.SetUpdatedBy(_user.GetUserId());
            await CommitAsync();
        }
    }
}
