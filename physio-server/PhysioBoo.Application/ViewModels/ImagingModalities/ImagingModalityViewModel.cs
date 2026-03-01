using PhysioBoo.Domain.Entities.LaboratoryImaging;

namespace PhysioBoo.Application.ViewModels.ImagingModalities
{
    public sealed class ImagingModalityViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Code { get; set; }
        public string? Description { get; set; }
        public string? Category { get; set; }
        public bool RequiresContrast { get; set; }
        public bool PreparationRequired { get; set; }
        public string? PreparationInstructions { get; set; }
        public int AverageDurationMinutes { get; set; }
        public decimal RadiationDose { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }

        public static ImagingModalityViewModel FromImagingModality(ImagingModality imagingModality)
        {
            return new ImagingModalityViewModel
            {
                Id = imagingModality.Id,
                Name = imagingModality.Name,
                Code = imagingModality.Code,
                Description = imagingModality.Description,
                Category = imagingModality.Category,
                RequiresContrast = imagingModality.RequiresContrast,
                PreparationRequired = imagingModality.PreparationRequired,
                PreparationInstructions = imagingModality.PreparationInstructions,
                AverageDurationMinutes = imagingModality.AverageDurationMinutes,
                RadiationDose = imagingModality.RadiationDose,
                IsActive = imagingModality.IsActive,
                CreatedAt = imagingModality.CreatedAt
            };
        }
    }
}
