using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Laboratory.AcknowledgeLabAlert
{
    public sealed class AcknowledgeLabAlertCommandHandler : CommandHandlerBase, IRequestHandler<AcknowledgeLabAlertCommand>
    {
        private readonly ILabAlertRepository _labAlertRepository;
        private readonly IUser _user;

        public AcknowledgeLabAlertCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ILabAlertRepository labAlertRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _labAlertRepository = labAlertRepository;
            _user = user;
        }

        public async Task Handle(AcknowledgeLabAlertCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            LabAlert? alert = await _labAlertRepository.GetAll(a => a.Id == request.Id).AsTracking().FirstOrDefaultAsync(cancellationToken);
            if (alert == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Lab alert with id {request.Id} doesn't exist.",
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
