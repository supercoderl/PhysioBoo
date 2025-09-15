using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.MedicalStaff
{
    public class MedicalSpecialty : Entity
    {
        #region Core Medical Speciality Table (11)
        public string Name { get; private set; }
        public string? Code { get; private set; }
        public string? Category { get; private set; }
        public string? Description { get; private set; }
        public string? RequiredQualifications { get; private set; }
        public int AverageConsultationDuration { get; private set; } // in minutes
        public bool IsSurgical { get; private set; }
        public bool IsDiagnostic { get; private set; }
        public Guid? ParentSpecialtyId { get; private set; }
        public string? IconUrl { get; private set; }
        public DateTime CreatedAt { get; private set; }

        [ForeignKey("ParentSpecialtyId")]
        [InverseProperty("SubSpecialties")]
        public virtual MedicalSpecialty? ParentSpecialty { get; private set; }

        [InverseProperty("Specialty")]
        public virtual ICollection<DoctorSpecialty> DoctorSpecialties { get; private set; } = new List<DoctorSpecialty>();

        [InverseProperty("ParentSpecialty")]
        public virtual ICollection<MedicalSpecialty> SubSpecialties { get; private set; } = new List<MedicalSpecialty>();
        #endregion

        #region Constructor (11)
        public MedicalSpecialty(
            Guid id,
            string name,
            string? code,
            string? category,
            string? description,
            string? requiredQualifications,
            Guid? parentSpecialtyId,
            string? iconUrl
        ) : base(id)
        {
            Name = name;
            Code = code;
            Category = category;
            Description = description;
            RequiredQualifications = requiredQualifications;
            AverageConsultationDuration = 30; // Default to 30 minutes
            IsSurgical = false; // Default to false
            IsDiagnostic = false; // Default to false
            ParentSpecialtyId = parentSpecialtyId;
            IconUrl = iconUrl;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
        }
        #endregion

        #region Setter Methods (11)
        public void SetName(string name) { Name = name; }
        public void SetCode(string? code) { Code = code; }
        public void SetCategory(string? category) { Category = category; }
        public void SetDescription(string? description) { Description = description; }
        public void SetRequiredQualifications(string? requiredQualifications) { RequiredQualifications = requiredQualifications; }
        public void SetAverageConsultationDuration(int duration) { AverageConsultationDuration = duration; }
        public void SetIsSurgical(bool isSurgical) { IsSurgical = isSurgical; }
        public void SetIsDiagnostic(bool isDiagnostic) { IsDiagnostic = isDiagnostic; }
        public void SetParentSpecialtyId(Guid? parentSpecialtyId) { ParentSpecialtyId = parentSpecialtyId; }
        public void SetIconUrl(string? iconUrl) { IconUrl = iconUrl; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        #endregion
    }
}
