using PhysioBoo.Domain.Entities.LaboratoryImaging;

namespace PhysioBoo.Application.ViewModels.LabTestCategories
{
    public sealed class LabTestCategoryLookupViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;

        public static LabTestCategoryLookupViewModel FromLabTestCategory(LabTestCategory labTestCategory)
        {
            return new LabTestCategoryLookupViewModel
            {
                Id = labTestCategory.Id,
                Name = labTestCategory.Name
            };
        }
    }
}
