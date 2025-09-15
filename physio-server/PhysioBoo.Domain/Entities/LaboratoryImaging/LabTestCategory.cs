using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.LaboratoryImaging
{
    public class LabTestCategory : Entity
    {
        #region Core Lab Test Category Table (6)
        public string Name { get; private set; }
        public string? Code { get; private set; }
        public string? Description { get; private set; }
        public string? Department { get; private set; }
        public bool IsActive { get; private set; }
        public DateTime CreatedAt { get; private set; }

        [InverseProperty("Category")]
        public virtual ICollection<LabTest> LabTests { get; set; } = new List<LabTest>();
        #endregion

        #region Constructor (6)
        public LabTestCategory(
            Guid id,
            string name,
            string? code,
            string? description,
            string? department
        ) : base(id)
        {
            Name = name;
            Code = code;
            Description = description;
            Department = department;
            IsActive = true;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
        }
        #endregion

        #region Setter Methods (6)
        public void SetName(string name) { Name = name; }
        public void SetCode(string? code) { Code = code; }
        public void SetDescription(string? description) { Description = description; }
        public void SetDepartment(string? department) { Department = department; }
        public void SetIsActive(bool isActive) { IsActive = isActive; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        #endregion
    }
}
