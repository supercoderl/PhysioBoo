using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.Core
{
    public class RolePermission : Entity
    {
        #region Core Role Permission Table (3)
        public Guid RoleId { get; private set; }
        public Guid PermissionId { get; private set; }
        public DateTime CreatedAt { get; private set; }

        [ForeignKey("RoleId")]
        [InverseProperty("RolePermissions")]
        public virtual Role? Role { get; set; }

        [ForeignKey("PermissionId")]
        [InverseProperty("RolePermissions")]
        public virtual Permission? Permission { get; set; }
        #endregion

        #region Constructor (3)
        public RolePermission(
            Guid id,
            Guid roleId,
            Guid permissionId
        ) : base(id)
        {
            RoleId = roleId;
            PermissionId = permissionId;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
        }
        #endregion

        #region Setter Methods (3)
        public void SetRoleId(Guid roleId) { RoleId = roleId; }
        public void SetPermissionId(Guid permissionId) { PermissionId = permissionId; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        #endregion
    }
}
