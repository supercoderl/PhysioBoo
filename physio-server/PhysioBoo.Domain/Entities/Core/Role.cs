using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.Core
{
    public class Role : Entity
    {
        #region Core Role Table (11)
        public string Name { get; private set; }
        public string Code { get; private set; }
        public string? Description { get; private set; }
        public string? Color { get; private set; }
        public string? Icon { get; private set; }
        public bool IsSystemRole { get; private set; }
        public bool IsActive { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public Guid CreatedBy { get; private set; }
        public DateTime? UpdatedAt { get; private set; }
        public Guid? UpdatedBy { get; private set; }

        [ForeignKey("CreatedBy")]
        [InverseProperty("CreatedRoles")]
        public virtual User? Creator { get; private set; }

        [ForeignKey("UpdatedBy")]
        [InverseProperty("UpdatedRoles")]
        public virtual User? Updater { get; private set; }

        [InverseProperty("Role")]
        public virtual ICollection<UserRole> UserRoles { get; private set; } = new List<UserRole>();

        [InverseProperty("Role")]
        public virtual ICollection<RolePermission> RolePermissions { get; private set; } = new List<RolePermission>();
        #endregion

        #region Constructor (10)
        public Role(
            Guid id,
            string name,
            string code,
            string? description,
            string? color,
            string? icon,
            Guid createdBy
        ) : base(id)
        {
            Name = name;
            Code = code;
            Description = description;
            Color = color;
            Icon = icon;
            IsActive = true;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
            CreatedBy = createdBy;
            UpdatedAt = null;
            UpdatedBy = null;
        }
        #endregion

        #region Setter Methods (11)
        public void SetName(string name) { Name = name; }
        public void SetCode(string code) { Code = code; }
        public void SetDescription(string? description) { Description = description; }
        public void SetColor(string? color) { Color = color; }
        public void SetIcon(string? icon) { Icon = icon; }
        public void SetIsSystemRole(bool isSystemRole) { IsSystemRole = isSystemRole; }
        public void SetIsActive(bool isActive) { IsActive = isActive; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        public void SetCreatedBy(Guid createdBy) { CreatedBy = createdBy; }
        public void SetUpdatedAt(DateTime? updatedAt) { UpdatedAt = updatedAt; }
        public void SetUpdatedBy(Guid? updatedBy) { UpdatedBy = updatedBy; }
        #endregion
    }
}
