namespace PhysioBoo.Shared.Events.Users
{
    public sealed class UserResetPasswordEvent : DomainEvent
    {
        public Guid UserId { get; }
        public string Email { get; }

        public UserResetPasswordEvent(Guid userId, string email) : base(userId)
        {
            UserId = userId;
            Email = email;
        }
    }
}
