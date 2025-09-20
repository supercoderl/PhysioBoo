namespace PhysioBoo.Shared.Events.Users
{
    public sealed class UserVerifiedEvent : DomainEvent
    {
        public string Token { get; }
        public string Type { get; }

        public UserVerifiedEvent(string token, string type) : base(Guid.NewGuid())
        {
            Token = token;
            Type = type;
        }
    }
}
