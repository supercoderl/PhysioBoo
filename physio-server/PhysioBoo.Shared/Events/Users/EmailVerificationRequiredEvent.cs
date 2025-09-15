namespace PhysioBoo.Shared.Events.Users
{
    public sealed class EmailVerificationRequiredEvent : DomainEvent
    {
        public Guid UserId { get; }
        public string Token { get; }
        public DateTime ExpiresAt { get; }

        public EmailVerificationRequiredEvent(Guid userId, string token, DateTime expiresAt) : base(Guid.NewGuid())
        {
            UserId = userId;
            Token = token;
            ExpiresAt = expiresAt;
        }
    }
}
