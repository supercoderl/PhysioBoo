using NpgsqlTypes;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.Operation;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.Clinical
{
    public class MedicineCategory : TenantEntity
    {
        #region Core Medicine Category Table (8)
        public string Name { get; private set; }
        public string? Code { get; private set; }
        public string? Description { get; private set; }
        public Guid? ParentCategoryId { get; private set; }
        public bool IsControlled { get; private set; }
        public bool RequiresPrescription { get; private set; }
        public string? StorageConditions { get; private set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public NpgsqlTsVector? SearchVector { get; private set; }

        public virtual User? Creator { get; private set; }
        public virtual User? Updater { get; private set; }
        public virtual MedicineCategory? ParentCategory { get; private set; }
        public virtual HospitalGroup? HospitalGroup { get; private set; }

        public virtual ICollection<Medicine> Medicines { get; private set; } = new List<Medicine>();
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
        #endregion
    }
}
