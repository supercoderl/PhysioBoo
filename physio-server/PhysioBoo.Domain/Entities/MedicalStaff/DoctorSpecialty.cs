using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Domain.Entities.MedicalStaff
{
    public class DoctorSpecialty : TenantEntity
    {
        #region Core Doctor Specialty Table (9)
        public Guid DoctorId { get; private set; }
        public Guid SpecialtyId { get; private set; }
        public ProficiencyLevel ProficiencyLevel { get; private set; }
        public int YearsOfExperience { get; private set; }
        public string? CertificationNumber { get; private set; }
        public DateOnly? CertificationDate { get; private set; }
        public DateOnly? CertificationExpiry { get; private set; }
        public bool IsPrimary { get; private set; }

        public virtual Doctor? Doctor { get; private set; }
        public virtual User? Creator { get; private set; }
        public virtual User? Updater { get; private set; }
        public virtual MedicalSpecialty? Specialty { get; private set; }
        public virtual HospitalGroup? HospitalGroup { get; private set; }

        public virtual ICollection<Doctor> Doctors { get; private set; } = new List<Doctor>();
        #endregion

        #region Constructor (9)
        public DoctorSpecialty(
            Guid id,
            Guid doctorId,
            Guid specialtyId,
            string? certificationNumber,
            DateOnly? certificationDate,
            DateOnly? certificationExpiry
        ) : base(id)
        {
            DoctorId = doctorId;
            SpecialtyId = specialtyId;
            ProficiencyLevel = ProficiencyLevel.Intermediate;
            YearsOfExperience = 0;
            CertificationNumber = certificationNumber;
            CertificationDate = certificationDate;
            CertificationExpiry = certificationExpiry;
            IsPrimary = false;
        }
        #endregion

        #region Setter Methods (9)
        public void SetDoctorId(Guid doctorId) { DoctorId = doctorId; }
        public void SetSpecialtyId(Guid specialtyId) { SpecialtyId = specialtyId; }
        public void SetProficiencyLevel(ProficiencyLevel proficiencyLevel) { ProficiencyLevel = proficiencyLevel; }
        public void SetYearsOfExperience(int yearsOfExperience) { YearsOfExperience = yearsOfExperience; }
        public void SetCertificationNumber(string? certificationNumber) { CertificationNumber = certificationNumber; }
        public void SetCertificationDate(DateOnly? certificationDate) { CertificationDate = certificationDate; }
        public void SetCertificationExpiry(DateOnly? certificationExpiry) { CertificationExpiry = certificationExpiry; }
        public void SetIsPrimary(bool isPrimary) { IsPrimary = isPrimary; }
        #endregion
    }
}
