using PhysioBoo.Domain.Entities.LaboratoryImaging;

namespace PhysioBoo.Application.ViewModels.LabTestCategories
{
    public sealed class LabTestCategoryViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Code { get; set; }
        public string? Description { get; set; }
        public string? Department { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }

        public static LabTestCategoryViewModel FromLabTestCategory(LabTestCategory labTestCategory)
        {
            return new LabTestCategoryViewModel
            {
                Id = labTestCategory.Id,
                Name = labTestCategory.Name,
                Code = labTestCategory.Code,
                Description = labTestCategory.Description,
                Department = labTestCategory.Department,
                IsActive = labTestCategory.IsActive,
                CreatedAt = labTestCategory.CreatedAt
            };
        }
    }
}
