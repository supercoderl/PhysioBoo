using PhysioBoo.Application.ViewModels.Surgeries;
using PhysioBoo.Domain.Entities.Theatre;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Surgeries.UpdateEquipmentItem
{
    public sealed class UpdateEquipmentItemCommandHandler : CommandHandlerBase, IRequestHandler<UpdateEquipmentItemCommand>
    {
        private readonly ISurgeryCaseRepository _surgeryRepository;
        private readonly ISurgeryEquipmentItemRepository _equipmentRepository;
        private readonly ISurgeryAlertRepository _alertRepository;
        private readonly IUser _user;

        public UpdateEquipmentItemCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ISurgeryCaseRepository surgeryRepository,
            ISurgeryEquipmentItemRepository equipmentRepository,
            ISurgeryAlertRepository alertRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _surgeryRepository = surgeryRepository;
            _equipmentRepository = equipmentRepository;
            _alertRepository = alertRepository;
            _user = user;
        }

        public async Task Handle(UpdateEquipmentItemCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            SurgeryEquipmentItem? item = await _equipmentRepository.GetByIdAsync(request.ItemId, ct: cancellationToken);
            if (item == null || item.SurgeryCaseId != request.SurgeryId)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Equipment item with id {request.ItemId} doesn't exist on this surgery.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            SurgeryCase? surgery = await _surgeryRepository.GetByIdAsync(request.SurgeryId, ct: cancellationToken);
            if (surgery == null || surgery.Status is SurgeryStatus.Cancelled or SurgeryStatus.Discharged)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "This surgery is closed and its equipment can no longer change.",
                    DomainErrorCodes.Surgery.NotEditable
                ));
                return;
            }

            EquipmentStatus status = Enum.Parse<EquipmentStatus>(request.Input.Status, true);
            int quantity = request.Input.Quantity ?? item.Quantity;
            Guid? userId = _user.GetUserId();
            DateTime? updatedAt = TimeZoneHelper.GetLocalTimeNow();

            await _equipmentRepository.BatchUpdateMultipleAsync(
                i => i.Id == request.ItemId,
                s => s
                    .SetProperty(i => i.Status, status)
                    .SetProperty(i => i.Quantity, quantity)
                    .SetProperty(i => i.UpdatedBy, userId)
                    .SetProperty(i => i.UpdatedAt, updatedAt),
                cancellationToken
            );

            // Missing equipment blocks the operation: raise one alert, not one per repeated click.
            if (status == EquipmentStatus.Missing && item.Status != EquipmentStatus.Missing)
            {
                SurgeryAlert alert = new SurgeryAlert(
                    Guid.NewGuid(),
                    surgery.Id,
                    surgery.PatientId,
                    SurgeryAlertType.EquipmentMissing,
                    SurgeryAlertSeverity.High,
                    $"{item.Name} is missing for {surgery.Procedure} ({surgery.SurgeryNumber}).",
                    "Locate or replace the item before the scheduled start."
                );
                alert.SetTenantId(_user.GetTenantId());
                alert.SetCreatedBy(_user.GetUserId());
                await _alertRepository.InsertAsync<SurgeryAlert, Guid>(alert);
            }

            item.SetStatus(status);
            item.SetQuantity(quantity);
            request.Result = SurgeryEquipmentItemViewModel.FromEntity(item);
        }
    }
}
