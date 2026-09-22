namespace PhysioBoo.Domain.Entities.Core
{
    public class TenantInvite : Entity
    {
        public string Token { get; private set; }
        public Guid TenantId { get; private set; }
        public Guid? HospitalId { get; private set; }
        public Domain.Enums.Role IntendedRole { get; private set; }
        public string? Email { get; private set; }
        public DateTime ExpiresAt { get; private set; }
        public bool IsUsed { get; private set; }
        public Guid CreatedBy { get; private set; }
        public Guid? UsedByUserId { get; private set; }

        public TenantInvite(
            Guid id,
            string token,
            Guid tenantId,
            Guid? hospitalId,
            Domain.Enums.Role intendedRole,
            string? email,
            DateTime expiresAt
        ) : base(id)
        {
            Token = token;
            TenantId = tenantId;
            HospitalId = hospitalId;
            IntendedRole = intendedRole;
            Email = email;
            ExpiresAt = expiresAt;
            IsUsed = false;
        }

        public void SetToken(string token) { Token = token; }
        public void SetTenantId(Guid tenantId) { TenantId = tenantId; }
        public void SetHospitalId(Guid? hospitalId) { HospitalId = hospitalId; }
        public void SetIntendedRole(Domain.Enums.Role intendedRole) { IntendedRole = intendedRole; }
        public void SetEmail(string? email) { Email = email; }
        public void SetExpiresAt(DateTime expiresAt) { ExpiresAt = expiresAt; }
        public void SetIsUsed(bool isUsed) { IsUsed = isUsed; }
        public void SetCreatedBy(Guid createdBy) { CreatedBy = createdBy; }
        public void SetUsedByUserId(Guid? usedByUserId) { UsedByUserId = usedByUserId; }
    }
}
