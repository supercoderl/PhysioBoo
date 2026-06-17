using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Domain.Entities.MedicalStaff
{
    public class Invitation : TenantEntity
    {
        #region Core Invitation Table (7)
        public string Email { get; private set; }
        public Guid RoleId { get; private set; }
        public string Token { get; private set; }
        public DateTime ExpiresAt { get; private set; }
        public InvitationStatus Status { get; private set; }
        public Guid InvitedByUserId { get; private set; }
        public DateTime? AcceptedAt { get; private set; }
        #endregion

        #region Constructor (7)
        public Invitation(
           Guid id,
           string email,
           Guid roleId,
           string token,
           DateTime expiresAt,
           InvitationStatus status,
           Guid invitedByUserId
        ) : base(id)
        {
            Email = email;
            RoleId = roleId;
            Token = token;
            ExpiresAt = expiresAt;
            Status = status;
            InvitedByUserId = invitedByUserId;
        }
        #endregion

        #region Setter Methods (7)
        public void SetEmail(string email) { Email = email; }
        public void SetRoleId(Guid roleId) { RoleId = roleId; }
        public void SetToken(string token) { Token = token; }
        public void SetExpiresAt(DateTime expiresAt) { ExpiresAt = expiresAt; }
        public void SetStatus(InvitationStatus status) { Status = status; }
        public void SetInvitedByUserId(Guid invitedByUserId) { InvitedByUserId = invitedByUserId; }
        public void SetAcceptedAt(DateTime? acceptedAt) { AcceptedAt = acceptedAt; }
        #endregion
    }
}
