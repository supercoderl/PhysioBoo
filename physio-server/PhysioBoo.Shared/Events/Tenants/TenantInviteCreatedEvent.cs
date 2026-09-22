namespace PhysioBoo.Shared.Events.Tenants
{
    public sealed class TenantInviteCreatedEvent : DomainEvent
    {
        public string? Email { get; }
        public string Token { get; }
        public DateTime ExpiresAt { get; }

        public TenantInviteCreatedEvent(
            Guid inviteId,
            string? email,
            string token,
            DateTime expiresAt
        ) : base(inviteId)
        {
            Email = email;
            Token = token;
            ExpiresAt = expiresAt;
        }
    }
}
