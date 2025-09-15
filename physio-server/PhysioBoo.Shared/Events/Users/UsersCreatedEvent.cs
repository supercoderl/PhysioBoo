namespace PhysioBoo.Shared.Events.Users
{
    public sealed class UsersCreatedEvent : DomainEvent
    {
        public List<Guid> UserIds { get; }

        public UsersCreatedEvent(List<Guid> userIds) : base(Guid.NewGuid())
        {
            UserIds = userIds;
        }
    }
}
