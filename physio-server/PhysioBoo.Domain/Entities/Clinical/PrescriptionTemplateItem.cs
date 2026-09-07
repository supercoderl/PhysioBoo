using PhysioBoo.Domain.Entities.Core;



namespace PhysioBoo.Domain.Entities.Clinical
{
    public class PrescriptionTemplateItem : TenantEntity
    {
        #region Core Prescription Template Item Table (15)
        public Guid PrescriptionTemplateId { get; private set; }
        public Guid MedicineId { get; private set; }
        public int DefaultQuantity { get; private set; }
        public string DefaultDosageInstructions { get; private set; }
        public string DefaultFrequency { get; private set; }
        public int DefaultDurationInDays { get; private set; }
        public string? DefaultRouteOfAdministration { get; private set; }
        public bool TimingMorning { get; private set; }
        public bool TimingNoon { get; private set; }
        public bool TimingAfternoon { get; private set; }
        public bool TimingEvening { get; private set; }
        public bool IsPrn { get; private set; }
        public BeforeAfterMeal BeforeAfterMeal { get; private set; }
        public string Unit { get; private set; }
        public int SortOrder { get; private set; }

        public virtual User? Creator { get; private set; }
        public virtual User? Updater { get; private set; }
        public virtual PrescriptionTemplate? PrescriptionTemplate { get; private set; }
        public virtual Medicine? Medicine { get; private set; }
        public virtual HospitalGroup? HospitalGroup { get; private set; }
        #endregion

        #region Constructor (15)
        public PrescriptionTemplateItem(
            Guid id,
            Guid prescriptionTemplateId,
            Guid medicineId,
            int defaultQuantity,
            string defaultDosageInstructions,
            string defaultFrequency,
            int defaultDurationInDays,
            string unit,
            int sortOrder
        ) : base(id)
        {
            PrescriptionTemplateId = prescriptionTemplateId;
            MedicineId = medicineId;
            DefaultQuantity = defaultQuantity;
            DefaultDosageInstructions = defaultDosageInstructions;
            DefaultFrequency = defaultFrequency;
            DefaultDurationInDays = defaultDurationInDays;
            Unit = unit;
            SortOrder = sortOrder;
        }
        #endregion

        #region Setter Methods (15)
        public void SetPrescriptionTemplateId(Guid prescriptionTemplateId)
        {
            PrescriptionTemplateId = prescriptionTemplateId;
        }

        public void SetMedicineId(Guid medicineId)
        {
            MedicineId = medicineId;
        }

        public void SetDefaultQuantity(int defaultQuantity)
        {
            DefaultQuantity = defaultQuantity;
        }

        public void SetDefaultDosageInstructions(string defaultDosageInstructions)
        {
            DefaultDosageInstructions = defaultDosageInstructions;
        }

        public void SetDefaultFrequency(string defaultFrequency)
        {
            DefaultFrequency = defaultFrequency;
        }

        public void SetDefaultDurationInDays(int defaultDurationInDays)
        {
            DefaultDurationInDays = defaultDurationInDays;
        }

        public void SetDefaultRouteOfAdministration(string? defaultRouteOfAdministration)
        {
            DefaultRouteOfAdministration = defaultRouteOfAdministration;
        }

        public void SetTimingMorning(bool timingMorning)
        {
            TimingMorning = timingMorning;
        }

        public void SetTimingNoon(bool timingNoon)
        {
            TimingNoon = timingNoon;
        }

        public void SetTimingAfternoon(bool timingAfternoon)
        {
            TimingAfternoon = timingAfternoon;
        }

        public void SetTimingEvening(bool timingEvening)
        {
            TimingEvening = timingEvening;
        }

        public void SetIsPrn(bool isPrn)
        {
            IsPrn = isPrn;
        }

        public void SetBeforeAfterMeal(BeforeAfterMeal beforeAfterMeal)
        {
            BeforeAfterMeal = beforeAfterMeal;
        }

        public void SetUnit(string unit)
        {
            Unit = unit;
        }

        public void SetSortOrder(int sortOrder)
        {
            SortOrder = sortOrder;
        }
        #endregion
    }
}
