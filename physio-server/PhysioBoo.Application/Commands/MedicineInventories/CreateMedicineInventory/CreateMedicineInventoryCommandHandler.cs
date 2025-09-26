using MediatR;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.MedicineInventories.CreateMedicineInventory
{
    public sealed class CreateMedicineInventoryCommandHandler : CommandHandlerBase, IRequestHandler<CreateMedicineInventoryCommand>
    {
        private readonly IMedicineInventoryRepository _medicineInventoryRepository;

        public CreateMedicineInventoryCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IMedicineInventoryRepository medicineInventoryRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _medicineInventoryRepository = medicineInventoryRepository;
        }

        public async Task Handle(CreateMedicineInventoryCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var result = await _medicineInventoryRepository.InsertAsync<MedicineInventory, Guid>(new MedicineInventory(
                request.NewMedicineInventory.Id,
                request.NewMedicineInventory.MedicineId,
                request.NewMedicineInventory.HospitalId,
                request.NewMedicineInventory.BatchNumber,
                request.NewMedicineInventory.SupplierId,
                request.NewMedicineInventory.PurchaseDate,
                request.NewMedicineInventory.ExpiryDate,
                request.NewMedicineInventory.UnitPurchasePrice,
                request.NewMedicineInventory.UnitPurchasePrice,
                request.NewMedicineInventory.TotalPurchaseValue,
                request.NewMedicineInventory.StorageLocation,
                null
            ));

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));

                return;
            }
        }
    }
}
