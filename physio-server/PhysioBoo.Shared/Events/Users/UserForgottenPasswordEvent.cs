namespace PhysioBoo.Shared.Events.Users
{
    public sealed class UserForgottenPasswordEvent : DomainEvent
    {
        public string Email { get; }

        public UserForgottenPasswordEvent(string email) : base(Guid.NewGuid())
        {
            Email = email;
        }
    }
}
