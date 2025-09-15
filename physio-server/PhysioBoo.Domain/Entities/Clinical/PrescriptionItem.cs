using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.Clinical
{
    public class PrescriptionItem : Entity
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
        public DateTime CreatedAt { get; private set; }

        [ForeignKey("PrescriptionId")]
        [InverseProperty("PrescriptionItems")]
        public virtual Prescription? Prescription { get; private set; }

        [ForeignKey("MedicineId")]
        [InverseProperty("PrescriptionItems")]
        public virtual Medicine? Medicine { get; private set; }
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
            decimal pricePerUnit
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
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
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
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        #endregion
    }
}
