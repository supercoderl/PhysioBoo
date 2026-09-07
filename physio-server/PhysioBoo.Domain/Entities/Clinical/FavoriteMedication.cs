using PhysioBoo.Domain.Entities.Core;

using PhysioBoo.Domain.Entities.MedicalStaff;

namespace PhysioBoo.Domain.Entities.Clinical
{
    public class FavoriteMedication : TenantEntity
    {
        #region Core Favorite Medication Table (5)
        public Guid DoctorId { get; private set; }
        public Guid MedicineId { get; private set; }
        public string? DefaultDose { get; private set; }
        public string? DefaultFrequency { get; private set; }
        public int? DefaultDurationInDays { get; private set; }

        public virtual User? Creator { get; private set; }
        public virtual User? Updater { get; private set; }
        public virtual Doctor? Doctor { get; private set; }
        public virtual Medicine? Medicine { get; private set; }
        public virtual HospitalGroup? HospitalGroup { get; private set; }
        #endregion

        #region Constructor (5)
        public FavoriteMedication(
            Guid id,
            Guid doctorId,
            Guid medicineId,
            string? defaultDose,
            string? defaultFrequency,
            int? defaultDurationInDays
        ) : base(id)
        {
            DoctorId = doctorId;
            MedicineId = medicineId;
            DefaultDose = defaultDose;
            DefaultFrequency = defaultFrequency;
            DefaultDurationInDays = defaultDurationInDays;
        }
        #endregion

        #region Setter Methods (5)
        public void SetDoctorId(Guid doctorId)
        {
            DoctorId = doctorId;
        }

        public void SetMedicineId(Guid medicineId)
        {
            MedicineId = medicineId;
        }

        public void SetDefaultDose(string? defaultDose)
        {
            DefaultDose = defaultDose;
        }

        public void SetDefaultFrequency(string? defaultFrequency)
        {
            DefaultFrequency = defaultFrequency;
        }

        public void SetDefaultDurationInDays(int? defaultDurationInDays)
        {
            DefaultDurationInDays = defaultDurationInDays;
        }
        #endregion
    }
}
