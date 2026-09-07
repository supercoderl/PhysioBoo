
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Medicines.UpdateMedicine
{
    public sealed class UpdateMedicineCommandHandler : CommandHandlerBase, IRequestHandler<UpdateMedicineCommand>
    {
        private readonly IMedicineRepository _medicineRepository;

        public UpdateMedicineCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IMedicineRepository medicineRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _medicineRepository = medicineRepository;
        }

        public async Task Handle(UpdateMedicineCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Medicine? medicine = await _medicineRepository.GetByIdAsync(request.Id);

            if (medicine == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Medicine with Id {request.Id} not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            medicine.SetName(request.Medicine.Name);
            medicine.SetGenericName(request.Medicine.GenericName);
            medicine.SetBrandName(request.Medicine.BrandName);
            medicine.SetCategoryId(request.Medicine.CategoryId);
            medicine.SetManufacturerId(request.Medicine.ManufacturerId);
            medicine.SetComposition(request.Medicine.Composition);
            medicine.SetStrength(request.Medicine.Strength);
            medicine.SetDosageForm(request.Medicine.DosageForm);
            medicine.SetRouteOfAdministration(request.Medicine.RouteOfAdministration);
            medicine.SetPackSize(request.Medicine.PackSize);
            medicine.SetMrp(request.Medicine.Mrp);
            medicine.SetPurchasePrice(request.Medicine.PurchasePrice);
            medicine.SetSellingPrice(request.Medicine.SellingPrice);
            medicine.SetHsnCode(request.Medicine.HsnCode);
            medicine.SetDrugCode(request.Medicine.DrugCode);
            medicine.SetBatchNumber(request.Medicine.BatchNumber);
            medicine.SetManufacturingDate(request.Medicine.ManufacturingDate);
            medicine.SetExpiryDate(request.Medicine.ExpiryDate);
            medicine.SetControlledSubstanceSchedule(request.Medicine.ControlledSubstanceSchedule);
            medicine.SetIsControlledSubstance(!string.IsNullOrWhiteSpace(request.Medicine.ControlledSubstanceSchedule));
            medicine.SetMaximumAge(request.Medicine.MaximumAge);
            medicine.SetPregnancyCategory(request.Medicine.PregnancyCategory);
            medicine.SetStorageTemperatureMin(request.Medicine.StorageTemperatureMin);
            medicine.SetStorageTemperatureMax(request.Medicine.StorageTemperatureMax);
            medicine.SetStorageConditions(request.Medicine.StorageConditions);
            medicine.SetSideEffects(request.Medicine.SideEffects);
            medicine.SetContraindications(request.Medicine.Contraindications);
            medicine.SetDrugInteractions(request.Medicine.DrugInteractions);
            medicine.SetOverdoseSymptoms(request.Medicine.OverdoseSymptoms);
            medicine.SetUsageInstructions(request.Medicine.UsageInstructions);
            medicine.SetWarningLabels(request.Medicine.WarningLabels);
            medicine.SetBarcode(request.Medicine.Barcode);
            medicine.SetQrCode(request.Medicine.QrCode);
            medicine.SetImageUrl(request.Medicine.ImageUrl);
            medicine.SetIsGeneric(!string.IsNullOrWhiteSpace(request.Medicine.GenericName) &&
                string.Equals(request.Medicine.Name, request.Medicine.GenericName, StringComparison.OrdinalIgnoreCase));
            medicine.SetIsBanned(!string.IsNullOrWhiteSpace(request.Medicine.BanReason));
            medicine.SetBanReason(request.Medicine.BanReason);
            medicine.SetTherapeuticClass(request.Medicine.TherapeuticClass);
            medicine.SetPharmacologicalClass(request.Medicine.PharmacologicalClass);
            medicine.SetApprovalNumber(request.Medicine.ApprovalNumber);
            medicine.SetApprovalDate(request.Medicine.ApprovalDate);
            medicine.SetIsActive(request.Medicine.IsActive);

            await _medicineRepository.UpdateTrackedAsync(medicine, ct);
        }
    }
}
