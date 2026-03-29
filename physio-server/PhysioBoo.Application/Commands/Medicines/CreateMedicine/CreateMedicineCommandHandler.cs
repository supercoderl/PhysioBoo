using MediatR;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Medicines.CreateMedicine
{
    public sealed class CreateMedicineCommandHandler : CommandHandlerBase, IRequestHandler<CreateMedicineCommand>
    {
        private readonly IMedicineRepository _medicineRepository;
        private readonly IUser _user;

        public CreateMedicineCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IMedicineRepository medicineRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _medicineRepository = medicineRepository;
            _user = user;
        }

        public async Task Handle(CreateMedicineCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Medicine newMedicine = new Medicine(
                request.NewMedicine.Id,
                request.NewMedicine.Name,
                request.NewMedicine.GenericName,
                request.NewMedicine.BrandName,
                request.NewMedicine.CategoryId,
                request.NewMedicine.ManufacturerId,
                request.NewMedicine.Composition,
                request.NewMedicine.Strength,
                request.NewMedicine.DosageForm,
                request.NewMedicine.RouteOfAdministration,
                request.NewMedicine.PackSize,
                request.NewMedicine.Mrp,
                request.NewMedicine.PurchasePrice,
                request.NewMedicine.SellingPrice,
                request.NewMedicine.HsnCode,
                request.NewMedicine.DrugCode,
                request.NewMedicine.BatchNumber,
                request.NewMedicine.ManufacturingDate,
                request.NewMedicine.ExpiryDate,
                request.NewMedicine.ControlledSubstanceSchedule,
                request.NewMedicine.MaximumAge,
                request.NewMedicine.PregnancyCategory,
                request.NewMedicine.StorageTemperatureMin,
                request.NewMedicine.StorageTemperatureMax,
                request.NewMedicine.StorageConditions,
                request.NewMedicine.SideEffects,
                request.NewMedicine.Contraindications,
                request.NewMedicine.DrugInteractions,
                request.NewMedicine.OverdoseSymptoms,
                request.NewMedicine.UsageInstructions,
                request.NewMedicine.WarningLabels,
                request.NewMedicine.Barcode,
                request.NewMedicine.QrCode,
                request.NewMedicine.ImageUrl,
                request.NewMedicine.BanReason,
                request.NewMedicine.TherapeuticClass,
                request.NewMedicine.PharmacologicalClass,
                request.NewMedicine.ApprovalNumber,
                request.NewMedicine.ApprovalDate
            );

            newMedicine.SetTenantId(_user.GetTenantId());
            newMedicine.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _medicineRepository.InsertAsync<Medicine, Guid>(newMedicine);

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
