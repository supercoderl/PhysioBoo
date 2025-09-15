using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.Clinical
{
    public class MedicineCategory : Entity
    {
        #region Core Medicine Category Table (8)
        public string Name { get; private set; }
        public string? Code { get; private set; }
        public string? Description { get; private set; }
        public Guid? ParentCategoryId { get; private set; }
        public bool IsControlled { get; private set; }
        public bool RequiresPrescription { get; private set; }
        public string? StorageConditions { get; private set; }
        public DateTime CreatedAt { get; private set; }

        [ForeignKey("ParentCategoryId")]
        [InverseProperty("SubCategories")]
        public virtual MedicineCategory? ParentCategory { get; private set; }

        [InverseProperty("Category")]
        public virtual ICollection<Medicine> Medicines { get; private set; } = new List<Medicine>();

        [InverseProperty("ParentCategory")]
        public virtual ICollection<MedicineCategory> SubCategories { get; private set; } = new List<MedicineCategory>();
        #endregion

        #region Constructor (8)
        public MedicineCategory(
            Guid id,
            string name,
            string? code,
            string? description,
            Guid? parentCategoryId,
            string? storageConditions
        ) : base(id)
        {
            Name = name;
            Code = code;
            Description = description;
            ParentCategoryId = parentCategoryId;
            IsControlled = false;
            RequiresPrescription = true;
            StorageConditions = storageConditions;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
        }
        #endregion

        #region Setter Methods (8)
        public void SetName(string name) { Name = name; }
        public void SetCode(string? code) { Code = code; }
        public void SetDescription(string? description) { Description = description; }
        public void SetParentCategoryId(Guid? parentCategoryId) { ParentCategoryId = parentCategoryId; }
        public void SetIsControlled(bool isControlled) { IsControlled = isControlled; }
        public void SetRequiresPrescription(bool requiresPrescription) { RequiresPrescription = requiresPrescription; }
        public void SetStorageConditions(string? storageConditions) { StorageConditions = storageConditions; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        #endregion
    }
}
