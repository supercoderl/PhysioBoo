using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.Queries.Dashboard;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Dashboard.DismissDashboardAlert
{
    /// <summary>Acknowledges the alert in the module it came from, so it also clears there.</summary>
    public sealed class DismissDashboardAlertCommandHandler : CommandHandlerBase, IRequestHandler<DismissDashboardAlertCommand>
    {
        private readonly ILabAlertRepository _labAlertRepository;
        private readonly IRadiologyAlertRepository _radiologyAlertRepository;
        private readonly ISurgeryAlertRepository _surgeryAlertRepository;
        private readonly IClinicalAlertRepository _clinicalAlertRepository;
        private readonly IInventoryAlertRepository _inventoryAlertRepository;
        private readonly IUser _user;

        public DismissDashboardAlertCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ILabAlertRepository labAlertRepository,
            IRadiologyAlertRepository radiologyAlertRepository,
            ISurgeryAlertRepository surgeryAlertRepository,
            IClinicalAlertRepository clinicalAlertRepository,
            IInventoryAlertRepository inventoryAlertRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _labAlertRepository = labAlertRepository;
            _radiologyAlertRepository = radiologyAlertRepository;
            _surgeryAlertRepository = surgeryAlertRepository;
            _clinicalAlertRepository = clinicalAlertRepository;
            _inventoryAlertRepository = inventoryAlertRepository;
            _user = user;
        }

        public async Task Handle(DismissDashboardAlertCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            DashboardAlertSource.TryParse(request.AlertId, out string source, out Guid id);
            DateTime now = TimeZoneHelper.GetLocalTimeNow();
            Guid userId = _user.GetUserId();
            string? note = request.ResolutionNote?.Trim();
            bool found;

            switch (source)
            {
                case DashboardAlertSource.Lab:
                {
                    var alert = await _labAlertRepository.GetAll(a => a.Id == id).AsTracking().FirstOrDefaultAsync(cancellationToken);
                    found = alert != null;
                    alert?.Acknowledge(userId, now);
                    break;
                }
                case DashboardAlertSource.Radiology:
                {
                    var alert = await _radiologyAlertRepository.GetAll(a => a.Id == id).AsTracking().FirstOrDefaultAsync(cancellationToken);
                    found = alert != null;
                    alert?.Acknowledge(userId, now);
                    break;
                }
                case DashboardAlertSource.Surgery:
                {
                    var alert = await _surgeryAlertRepository.GetAll(a => a.Id == id).AsTracking().FirstOrDefaultAsync(cancellationToken);
                    found = alert != null;
                    if (alert != null && !alert.IsAcknowledged)
                    {
                        alert.SetIsAcknowledged(true);
                        alert.SetAcknowledgedAt(now);
                        alert.SetAcknowledgedByName(_user.Name);
                        alert.SetAcknowledgeNote(note);
                    }
                    break;
                }
                case DashboardAlertSource.Clinical:
                {
                    var alert = await _clinicalAlertRepository.GetAll(a => a.Id == id).AsTracking().FirstOrDefaultAsync(cancellationToken);
                    found = alert != null;
                    if (alert != null && !alert.IsAcknowledged)
                    {
                        alert.SetIsAcknowledged(true);
                        alert.SetAcknowledgedAt(now);
                        alert.SetAcknowledgedByName(_user.Name);
                        alert.SetAcknowledgeNote(note);
                    }
                    break;
                }
                default:
                {
                    var alert = await _inventoryAlertRepository.GetAll(a => a.Id == id).AsTracking().FirstOrDefaultAsync(cancellationToken);
                    found = alert != null;
                    if (alert != null && alert.AcknowledgedAt == null) alert.Acknowledge(userId);
                    break;
                }
            }

            if (!found)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Alert {request.AlertId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            await CommitAsync();
        }
    }
}
