using PhysioBoo.Domain.Entities.Clinical;

namespace PhysioBoo.Application.ViewModels.MedicineCategories
{
    public sealed class MedicineCategoryViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Code { get; set; }
        public string? Description { get; set; }
        public Guid? ParentCategoryId { get; set; }
        public bool IsControlled { get; set; }
        public bool RequiresPrescription { get; set; }
        public string? StorageConditions { get; set; }
        public DateTime CreatedAt { get; set; }

        public static MedicineCategoryViewModel FromMedicineCategory(MedicineCategory entity)
        {
            return new MedicineCategoryViewModel
            {
                Id = entity.Id,
                Name = entity.Name,
                Code = entity.Code,
                Description = entity.Description,
                ParentCategoryId = entity.ParentCategoryId,
                IsControlled = entity.IsControlled,
                RequiresPrescription = entity.RequiresPrescription,
                StorageConditions = entity.StorageConditions,
                CreatedAt = entity.CreatedAt
            };
        }
    }
}
