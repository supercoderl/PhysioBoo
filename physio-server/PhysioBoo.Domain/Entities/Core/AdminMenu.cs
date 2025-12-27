using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.Core
{
    public class AdminMenu : Entity
    {
        #region Core Menu Table (11)
        public string Label { get; private set; }
        public string Icon { get; private set; }
        public string Route { get; private set; }
        public Guid? ParentId { get; private set; }
        public bool IsActive { get; private set; }
        public int Order { get; private set; }
        public string PermissionCode { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public Guid CreatedBy { get; private set; }
        public DateTime? UpdatedAt { get; private set; }
        public Guid? UpdatedBy { get; private set; }

        [ForeignKey("ParentId")]
        [InverseProperty("SubMenus")]
        public virtual AdminMenu? ParentMenu { get; private set; }

        [ForeignKey("CreatedBy")]
        [InverseProperty("CreatedMenus")]
        public virtual User? Creator { get; private set; }

        [ForeignKey("UpdatedBy")]
        [InverseProperty("UpdatedMenus")]
        public virtual User? Updater { get; private set; }

        [InverseProperty("ParentMenu")]
        public virtual ICollection<AdminMenu> SubMenus { get; private set; } = new List<AdminMenu>();
        #endregion

        #region Constructor (11)
        public AdminMenu(
            Guid id,
            string label,
            string icon,
            string route,
            Guid? parentId,
            int order,
            string permissionCode,
            Guid createdBy
        ) : base(id)
        {
            Label = label;
            Icon = icon;
            Route = route;
            ParentId = parentId;
            Order = order;
            PermissionCode = permissionCode;
            IsActive = true;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
            CreatedBy = createdBy;
        }
        #endregion

        #region Setter Methods (11)
        public void SetLabel(string label) { Label = label; }
        public void SetIcon(string icon) { Icon = icon; }
        public void SetRoute(string route) { Route = route; }
        public void SetParentId(Guid? parentId) { ParentId = parentId; }
        public void SetIsActive(bool isActive) { IsActive = isActive; }
        public void SetOrder(int order) { Order = order; }
        public void SetPermissionCode(string permissionCode) { PermissionCode = permissionCode; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        public void SetCreatedBy(Guid createdBy) { CreatedBy = createdBy; }
        public void SetUpdatedAt(DateTime? updatedAt) { UpdatedAt = updatedAt; }
        public void SetUpdatedBy(Guid? updatedBy) { UpdatedBy = updatedBy; }
        #endregion
    }
}
