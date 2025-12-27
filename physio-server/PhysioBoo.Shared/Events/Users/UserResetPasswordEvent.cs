namespace PhysioBoo.Shared.Events.Users
{
    public sealed class UserResetPasswordEvent : DomainEvent
    {
        public Guid UserId { get; }
        public string Token { get; }

        public UserResetPasswordEvent(Guid userId, string token) : base(userId)
        {
            UserId = userId;
            Token = token;
        }
    }
}
