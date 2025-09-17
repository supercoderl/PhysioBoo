namespace PhysioBoo.Shared.Events.Users
{
    public sealed class UserVerifiedEvent : DomainEvent
    {
        public string Token { get; }

        public UserVerifiedEvent(string token) : base(Guid.NewGuid())
        {
            Token = token;
        }
    }
}
