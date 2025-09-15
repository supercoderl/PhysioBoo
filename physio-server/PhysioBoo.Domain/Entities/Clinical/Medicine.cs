using PhysioBoo.Domain.Entities.Support;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.Clinical
{
    public class Medicine : Entity
    {
        #region Core Medicine Table (48)
        public string Name { get; private set; }
        public string? GenericName { get; private set; }
        public string? BrandName { get; private set; }
        public Guid CategoryId { get; private set; }
        public Guid ManufacturerId { get; private set; }
        public string? Composition { get; private set; }
        public string? Strength { get; private set; }
        public DosageForm DosageForm { get; private set; }
        public string? RouteOfAdministration { get; private set; }
        public string? PackSize { get; private set; }
        public decimal? Mrp { get; private set; }
        public decimal? PurchasePrice { get; private set; }
        public decimal? SellingPrice { get; private set; }
        public decimal DiscountPercentage { get; private set; }
        public decimal TaxPercentage { get; private set; }
        public string? HsnCode { get; private set; }
        public string? DrugCode { get; private set; }
        public string? BatchNumber { get; private set; }
        public DateOnly? ManufacturingDate { get; private set; }
        public DateOnly? ExpiryDate { get; private set; }
        public bool IsPrescriptionRequired { get; private set; }
        public bool IsControlledSubstance { get; private set; }
        public string? ControlledSubstanceSchedule { get; private set; }
        public int MinimumAge { get; private set; }
        public int? MaximumAge { get; private set; }
        public string? PregnancyCategory { get; private set; }
        public int? StorageTemperatureMin { get; private set; }
        public int? StorageTemperatureMax { get; private set; }
        public string? StorageConditions { get; private set; }
        public string? SideEffects { get; private set; }
        public string? Contraindications { get; private set; }
        public string? DrugInteractions { get; private set; }
        public string? OverdoseSymptoms { get; private set; }
        public string? UsageInstructions { get; private set; }
        public string[] WarningLabels { get; private set; }
        public string? Barcode { get; private set; }
        public string? QrCode { get; private set; }
        public string? ImageUrl { get; private set; }
        public bool IsGeneric { get; private set; }
        public bool IsBanned { get; private set; }
        public string? BanReason { get; private set; }
        public string? TherapeuticClass { get; private set; }
        public string? PharmacologicalClass { get; private set; }
        public string? ApprovalNumber { get; private set; }
        public DateOnly? ApprovalDate { get; private set; }
        public bool IsActive { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }

        [ForeignKey("CategoryId")]
        [InverseProperty("Medicines")]
        public virtual MedicineCategory? Category { get; private set; }

        [ForeignKey("ManufacturerId")]
        [InverseProperty("Medicines")]
        public virtual Manufacturer? Manufacturer { get; private set; }

        [InverseProperty("Medicine")]
        public virtual ICollection<MedicineInventory> MedicineInventories { get; private set; } = new List<MedicineInventory>();

        [InverseProperty("Medicine")]
        public virtual ICollection<PrescriptionItem> PrescriptionItems { get; private set; } = new List<PrescriptionItem>();
        #endregion

        #region Constructor (48)
        public Medicine(
            Guid id,
            string name,
            string? genericName,
            string? brandName,
            Guid categoryId,
            Guid manufacturerId,
            string? composition,
            string? strength,
            DosageForm dosageForm,
            string? routeOfAdministration,
            string? packSize,
            decimal? mrp,
            decimal? purchasePrice,
            decimal? sellingPrice,
            string? hsnCode,
            string? drugCode,
            string? batchNumber,
            DateOnly? manufacturingDate,
            DateOnly? expiryDate,
            string? controlledSubstanceSchedule,
            int? maximumAge,
            string? pregnancyCategory,
            int? storageTemperatureMin,
            int? storageTemperatureMax,
            string? storageConditions,
            string? sideEffects,
            string? contraindications,
            string? drugInteractions,
            string? overdoseSymptoms,
            string? usageInstructions,
            string[] warningLabels,
            string? barcode,
            string? qrCode,
            string? imageUrl,
            string? banReason,
            string? therapeuticClass,
            string? pharmacologicalClass,
            string? approvalNumber,
            DateOnly? approvalDate
        ) : base(id)
        {
            Name = name;
            GenericName = genericName;
            BrandName = brandName;
            CategoryId = categoryId;
            ManufacturerId = manufacturerId;
            Composition = composition;
            Strength = strength;
            DosageForm = dosageForm;
            RouteOfAdministration = routeOfAdministration;
            PackSize = packSize;
            Mrp = mrp;
            PurchasePrice = purchasePrice;
            SellingPrice = sellingPrice;
            DiscountPercentage = 0;
            TaxPercentage = 0;
            HsnCode = hsnCode;
            DrugCode = drugCode;
            BatchNumber = batchNumber;
            ManufacturingDate = manufacturingDate;
            ExpiryDate = expiryDate;
            IsPrescriptionRequired = true;
            IsControlledSubstance = !string.IsNullOrWhiteSpace(controlledSubstanceSchedule);
            ControlledSubstanceSchedule = controlledSubstanceSchedule;
            MinimumAge = 0;
            MaximumAge = maximumAge;
            PregnancyCategory = pregnancyCategory;
            StorageTemperatureMin = storageTemperatureMin;
            StorageTemperatureMax = storageTemperatureMax;
            StorageConditions = storageConditions;
            SideEffects = sideEffects;
            Contraindications = contraindications;
            DrugInteractions = drugInteractions;
            OverdoseSymptoms = overdoseSymptoms;
            UsageInstructions = usageInstructions;
            WarningLabels = warningLabels;
            Barcode = barcode;
            QrCode = qrCode;
            ImageUrl = imageUrl;
            IsGeneric = !string.IsNullOrWhiteSpace(genericName) && string.Equals(name, genericName, StringComparison.OrdinalIgnoreCase);
            IsBanned = !string.IsNullOrWhiteSpace(banReason);
            BanReason = banReason;
            TherapeuticClass = therapeuticClass;
            PharmacologicalClass = pharmacologicalClass;
            ApprovalNumber = approvalNumber;
            ApprovalDate = approvalDate;
            IsActive = true;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
            UpdatedAt = null;
        }
        #endregion

        #region Setter Methods (48)
        public void SetName(string name) { Name = name; }
        public void SetGenericName(string? genericName) { GenericName = genericName; }
        public void SetBrandName(string? brandName) { BrandName = brandName; }
        public void SetCategoryId(Guid categoryId) { CategoryId = categoryId; }
        public void SetManufacturerId(Guid manufacturerId) { ManufacturerId = manufacturerId; }
        public void SetComposition(string? composition) { Composition = composition; }
        public void SetStrength(string? strength) { Strength = strength; }
        public void SetDosageForm(DosageForm dosageForm) { DosageForm = dosageForm; }
        public void SetRouteOfAdministration(string? routeOfAdministration) { RouteOfAdministration = routeOfAdministration; }
        public void SetPackSize(string? packSize) { PackSize = packSize; }
        public void SetMrp(decimal? mrp) { Mrp = mrp; }
        public void SetPurchasePrice(decimal? purchasePrice) { PurchasePrice = purchasePrice; }
        public void SetSellingPrice(decimal? sellingPrice) { SellingPrice = sellingPrice; }
        public void SetDiscountPercentage(decimal discountPercentage) { DiscountPercentage = discountPercentage; }
        public void SetTaxPercentage(decimal taxPercentage) { TaxPercentage = taxPercentage; }
        public void SetHsnCode(string? hsnCode) { HsnCode = hsnCode; }
        public void SetDrugCode(string? drugCode) { DrugCode = drugCode; }
        public void SetBatchNumber(string? batchNumber) { BatchNumber = batchNumber; }
        public void SetManufacturingDate(DateOnly? manufacturingDate) { ManufacturingDate = manufacturingDate; }
        public void SetExpiryDate(DateOnly? expiryDate) { ExpiryDate = expiryDate; }
        public void SetIsPrescriptionRequired(bool isPrescriptionRequired) { IsPrescriptionRequired = isPrescriptionRequired; }
        public void SetIsControlledSubstance(bool isControlledSubstance) { IsControlledSubstance = isControlledSubstance; }
        public void SetControlledSubstanceSchedule(string? controlledSubstanceSchedule) { ControlledSubstanceSchedule = controlledSubstanceSchedule; }
        public void SetMinimumAge(int minimumAge) { MinimumAge = minimumAge; }
        public void SetMaximumAge(int? maximumAge) { MaximumAge = maximumAge; }
        public void SetPregnancyCategory(string? pregnancyCategory) { PregnancyCategory = pregnancyCategory; }
        public void SetStorageTemperatureMin(int? storageTemperatureMin) { StorageTemperatureMin = storageTemperatureMin; }
        public void SetStorageTemperatureMax(int? storageTemperatureMax) { StorageTemperatureMax = storageTemperatureMax; }
        public void SetStorageConditions(string? storageConditions) { StorageConditions = storageConditions; }
        public void SetSideEffects(string? sideEffects) { SideEffects = sideEffects; }
        public void SetContraindications(string? contraindications) { Contraindications = contraindications; }
        public void SetDrugInteractions(string? drugInteractions) { DrugInteractions = drugInteractions; }
        public void SetOverdoseSymptoms(string? overdoseSymptoms) { OverdoseSymptoms = overdoseSymptoms; }
        public void SetUsageInstructions(string? usageInstructions) { UsageInstructions = usageInstructions; }
        public void SetWarningLabels(string[] warningLabels) { WarningLabels = warningLabels; }
        public void SetBarcode(string? barcode) { Barcode = barcode; }
        public void SetQrCode(string? qrCode) { QrCode = qrCode; }
        public void SetImageUrl(string? imageUrl) { ImageUrl = imageUrl; }
        public void SetIsGeneric(bool isGeneric) { IsGeneric = isGeneric; }
        public void SetIsBanned(bool isBanned) { IsBanned = isBanned; }
        public void SetBanReason(string? banReason) { BanReason = banReason; }
        public void SetTherapeuticClass(string? therapeuticClass) { TherapeuticClass = therapeuticClass; }
        public void SetPharmacologicalClass(string? pharmacologicalClass) { PharmacologicalClass = pharmacologicalClass; }
        public void SetApprovalNumber(string? approvalNumber) { ApprovalNumber = approvalNumber; }
        public void SetApprovalDate(DateOnly? approvalDate) { ApprovalDate = approvalDate; }
        public void SetIsActive(bool isActive) { IsActive = isActive; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        public void SetUpdatedAt(DateTime? updatedAt) { UpdatedAt = updatedAt; }
        #endregion
    }
}
