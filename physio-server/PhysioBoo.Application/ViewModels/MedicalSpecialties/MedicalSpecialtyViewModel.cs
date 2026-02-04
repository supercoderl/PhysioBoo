using PhysioBoo.Domain.Entities.MedicalStaff;

namespace PhysioBoo.Application.ViewModels.MedicalSpecialties
{
    public sealed class MedicalSpecialtyViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Code { get; set; }
        public string? Category { get; set; }
        public string? Description { get; set; }
        public string? RequiredQualifications { get; set; }
        public int AverageConsultationDuration { get; set; }
        public bool IsSurgical { get; set; }
        public bool IsDiagnostic { get; set; }
        public Guid? ParentSpecialtyId { get; set; }
        public string? IconUrl { get; set; }
        public DateTime CreatedAt { get; set; }

        public static MedicalSpecialtyViewModel FromMedicalSpecialty(MedicalSpecialty medicalSpecialty)
        {
            return new MedicalSpecialtyViewModel
            {
                Id = medicalSpecialty.Id,
                Name = medicalSpecialty.Name,
                Code = medicalSpecialty.Code,
                Category = medicalSpecialty.Category,
                Description = medicalSpecialty.Description,
                RequiredQualifications = medicalSpecialty.RequiredQualifications,
                AverageConsultationDuration = medicalSpecialty.AverageConsultationDuration,
                IsSurgical = medicalSpecialty.IsSurgical,
                IsDiagnostic = medicalSpecialty.IsDiagnostic,
                ParentSpecialtyId = medicalSpecialty.ParentSpecialtyId,
                IconUrl = medicalSpecialty.IconUrl,
                CreatedAt = medicalSpecialty.CreatedAt
            };
        }
    }
}
