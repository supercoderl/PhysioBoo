using PhysioBoo.Application.ViewModels.Surgeries;
using PhysioBoo.Domain.Entities.Theatre;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Surgeries.UpdateChecklistItem
{
    public sealed class UpdateChecklistItemCommandHandler : CommandHandlerBase, IRequestHandler<UpdateChecklistItemCommand>
    {
        private readonly ISurgeryCaseRepository _surgeryRepository;
        private readonly ISurgeryChecklistItemRepository _checklistRepository;
        private readonly IUser _user;

        public UpdateChecklistItemCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ISurgeryCaseRepository surgeryRepository,
            ISurgeryChecklistItemRepository checklistRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _surgeryRepository = surgeryRepository;
            _checklistRepository = checklistRepository;
            _user = user;
        }

        public async Task Handle(UpdateChecklistItemCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            SurgeryChecklistItem? item = await _checklistRepository.GetByIdAsync(request.ItemId, ct: cancellationToken);
            if (item == null || item.SurgeryCaseId != request.SurgeryId)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Checklist item with id {request.ItemId} doesn't exist on this surgery.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            if (!await _surgeryRepository.ExistsAsync(
                c => c.Id == request.SurgeryId && c.Status != SurgeryStatus.Cancelled && c.Status != SurgeryStatus.Discharged,
                cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "This surgery is closed and its checklist can no longer change.",
                    DomainErrorCodes.Surgery.NotEditable
                ));
                return;
            }

            ChecklistItemStatus status = Enum.Parse<ChecklistItemStatus>(request.Input.Status, true);
            DateTime now = TimeZoneHelper.GetLocalTimeNow();

            // The signer is always the signed-in user, never a name sent by the client.
            string? signedByName = status == ChecklistItemStatus.Pending ? null : _user.Name;
            DateTime? signedAt = status == ChecklistItemStatus.Pending ? null : now;
            Guid? userId = _user.GetUserId();
            DateTime? updatedAt = now;

            await _checklistRepository.BatchUpdateMultipleAsync(
                i => i.Id == request.ItemId,
                s => s
                    .SetProperty(i => i.Status, status)
                    .SetProperty(i => i.SignedByName, signedByName)
                    .SetProperty(i => i.SignedAt, signedAt)
                    .SetProperty(i => i.UpdatedBy, userId)
                    .SetProperty(i => i.UpdatedAt, updatedAt),
                cancellationToken
            );

            item.SetStatus(status);
            item.SetSignedByName(signedByName);
            item.SetSignedAt(signedAt);
            request.Result = PreOpChecklistItemViewModel.FromEntity(item);
        }
    }
}
