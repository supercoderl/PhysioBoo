using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.Core
{
    public class UserRole : Entity
    {
        #region Core User Role Table (4)
        public Guid UserId { get; private set; }
        public Guid RoleId { get; private set; }
        public DateTime AssignedAt { get; private set; }
        public Guid? AssignedBy { get; private set; }

        [ForeignKey("UserId")]
        [InverseProperty("UserRoles")]
        public virtual User? User { get; set; }

        [ForeignKey("RoleId")]
        [InverseProperty("UserRoles")]
        public virtual Role? Role { get; set; }

        [ForeignKey("AssignedBy")]
        [InverseProperty("AssignedUserRoles")]
        public virtual User? Assigner { get; set; }
        #endregion

        #region Constructor (4)
        public UserRole(
            Guid id,
            Guid userId,
            Guid roleId,
            Guid? assignedBy
        ) : base(id)
        {
            UserId = userId;
            RoleId = roleId;
            AssignedAt = TimeZoneHelper.GetLocalTimeNow();
            AssignedBy = assignedBy;
        }
        #endregion

        #region Setter Methods (4)
        public void SetUserId(Guid userId) { UserId = userId; }
        public void SetRoleId(Guid roleId) { RoleId = roleId; }
        public void SetAssingedAt(DateTime assignedAt) { AssignedAt = assignedAt; }
        public void SetAssignedBy(Guid? assignedBy) { AssignedBy = assignedBy; }
        #endregion
    }
}
