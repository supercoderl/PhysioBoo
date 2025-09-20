namespace PhysioBoo.Shared.Events.Users
{
    public sealed class EmailVerificationTokenGeneratedEvent : DomainEvent
    {
        public Guid? UserId { get; }
        public string? Email { get; }
        public string Token { get; }
        public DateTime ExpiresAt { get; }
        public string Type { get; set; }

        public EmailVerificationTokenGeneratedEvent(
            Guid? userId,
            string? email,
            string token,
            DateTime expiresAt,
            string type
        ) : base(Guid.NewGuid())
        {
            UserId = userId;
            Email = email;
            Token = token;
            ExpiresAt = expiresAt;
            Type = type;
        }
    }
}
