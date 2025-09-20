namespace PhysioBoo.Shared.Events.Users
{
    public sealed class UsersCreatedEvent : DomainEvent
    {
        public List<Guid> UserIds { get; }
        public string Type { get; }

        public UsersCreatedEvent(List<Guid> userIds, string type) : base(Guid.NewGuid())
        {
            UserIds = userIds;
            Type = type;
        }
    }
}
