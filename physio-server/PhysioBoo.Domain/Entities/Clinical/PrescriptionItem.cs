using PhysioBoo.Domain.Entities.Core;



namespace PhysioBoo.Domain.Entities.Clinical
{
    public class PrescriptionItem : TenantEntity
    {
        #region Core Prescription Item Table (18)
        public Guid PrescriptionId { get; private set; }
        public Guid MedicineId { get; private set; }
        public string MedicineName { get; private set; }
        public string? GenericName { get; private set; }
        public string? Strength { get; private set; }
        public string? DosageForm { get; private set; }
        public int QuantityPrescribed { get; private set; }
        public int QuantityDispensed { get; private set; }
        public string DosageInstructions { get; private set; }
        public string Frequency { get; private set; }
        public int DurationInDays { get; private set; }
        public string? RouteOfAdministration { get; private set; }
        public string? SpecialInstructions { get; private set; }
        public decimal PricePerUnit { get; private set; }
        public decimal TotalPrice { get; private set; }
        public bool SubtituteAllowed { get; private set; }
        public bool IsControlledSubstance { get; private set; }
        public bool TimingMorning { get; private set; }
        public bool TimingNoon { get; private set; }
        public bool TimingAfternoon { get; private set; }
        public bool TimingEvening { get; private set; }
        public bool IsPrn { get; private set; }
        public BeforeAfterMeal BeforeAfterMeal { get; private set; }
        public string Unit { get; private set; }
        public int RefillCount { get; private set; }
        public bool IsInsuranceCovered { get; private set; }
        public bool IsCatalogVerified { get; private set; } = true;

        public virtual User? Creator { get; private set; }
        public virtual User? Updater { get; private set; }
        public virtual Prescription? Prescription { get; private set; }
        public virtual Medicine? Medicine { get; private set; }
        public virtual HospitalGroup? HospitalGroup { get; private set; }

        public virtual ICollection<PrescriptionClinicalWarning> PrescriptionClinicalWarnings { get; private set; } = new List<PrescriptionClinicalWarning>();
        #endregion

        #region Constructor (18)
        public PrescriptionItem(
            Guid id,
            Guid prescriptionId,
            Guid medicineId,
            string medicineName,
            string? genericName,
            string? strength,
            string? dosageForm,
            int quantityPrescribed,
            string dosageInstructions,
            string frequency,
            int durationInDays,
            string? routeOfAdministration,
            string? specialInstructions,
            decimal pricePerUnit,
            string unit
        ) : base(id)
        {
            PrescriptionId = prescriptionId;
            MedicineId = medicineId;
            MedicineName = medicineName;
            GenericName = genericName;
            Strength = strength;
            DosageForm = dosageForm;
            QuantityPrescribed = quantityPrescribed;
            QuantityDispensed = 0;
            DosageInstructions = dosageInstructions;
            Frequency = frequency;
            DurationInDays = durationInDays;
            RouteOfAdministration = routeOfAdministration;
            SpecialInstructions = specialInstructions;
            PricePerUnit = pricePerUnit;
            TotalPrice = quantityPrescribed * pricePerUnit;
            SubtituteAllowed = true;
            IsControlledSubstance = false;
            Unit = unit;
        }
        #endregion

        #region Setter Methods (25)
        public void SetPrescriptionId(Guid prescriptionId) { PrescriptionId = prescriptionId; }
        public void SetMedicineId(Guid medicineId) { MedicineId = medicineId; }
        public void SetMedicineName(string medicineName) { MedicineName = medicineName; }
        public void SetGenericName(string? genericName) { GenericName = genericName; }
        public void SetStrength(string? strength) { Strength = strength; }
        public void SetDosageForm(string? dosageForm) { DosageForm = dosageForm; }
        public void SetQuantityPrescribed(int quantityPrescribed)
        {
            QuantityPrescribed = quantityPrescribed;
            TotalPrice = QuantityPrescribed * PricePerUnit;
        }
        public void SetDosageInstructions(string dosageInstructions) { DosageInstructions = dosageInstructions; }
        public void SetFrequency(string frequency) { Frequency = frequency; }
        public void SetDurationInDays(int durationInDays) { DurationInDays = durationInDays; }
        public void SetRouteOfAdministration(string? routeOfAdministration) { RouteOfAdministration = routeOfAdministration; }
        public void SetSpecialInstructions(string? specialInstructions) { SpecialInstructions = specialInstructions; }
        public void SetPricePerUnit(decimal pricePerUnit)
        {
            PricePerUnit = pricePerUnit;
            TotalPrice = QuantityPrescribed * PricePerUnit;
        }
        public void SetQuantityDispensed(int quantityDispensed) { QuantityDispensed = quantityDispensed; }
        public void SetSubtituteAllowed(bool subtituteAllowed) { SubtituteAllowed = subtituteAllowed; }
        public void SetIsControlledSubstance(bool isControlledSubstance) { IsControlledSubstance = isControlledSubstance; }
        public void SetTimingMorning(bool timingMorning) { TimingMorning = timingMorning; }
        public void SetTimingNoon(bool timingNoon) { TimingNoon = timingNoon; }
        public void SetTimingAfternoon(bool timingAfternoon) { TimingAfternoon = timingAfternoon; }
        public void SetTimingEvening(bool timingEvening) { TimingEvening = timingEvening; }
        public void SetIsPrn(bool isPrn) { IsPrn = isPrn; }
        public void SetBeforeAfterMeal(BeforeAfterMeal beforeAfterMeal) { BeforeAfterMeal = beforeAfterMeal; }
        public void SetUnit(string unit) { Unit = unit; }
        public void SetRefillCount(int refillCount) { RefillCount = refillCount; }
        public void SetIsInsuranceCovered(bool isInsuranceCovered) { IsInsuranceCovered = isInsuranceCovered; }
        public void SetIsCatalogVerified(bool isCatalogVerified) { IsCatalogVerified = isCatalogVerified; }
        #endregion
    }
}
