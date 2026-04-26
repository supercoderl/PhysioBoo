using NpgsqlTypes;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.Core
{
    public class AdminMenu : AuditEntity
    {
        #region Core Menu Table (11)
        public string Label { get; private set; }
        public string Icon { get; private set; }
        public string Route { get; private set; }
        public Guid? ParentId { get; private set; }
        public bool IsActive { get; private set; }
        public int Order { get; private set; }
        public string PermissionCode { get; private set; }

        public virtual AdminMenu? ParentMenu { get; private set; }
        public virtual User? Creator { get; private set; }
        public virtual User? Updater { get; private set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public NpgsqlTsVector? SearchVector { get; private set; }

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
            string permissionCode
        ) : base(id)
        {
            Label = label;
            Icon = icon;
            Route = route;
            ParentId = parentId;
            Order = order;
            PermissionCode = permissionCode;
            IsActive = true;
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
        #endregion
    }
}
