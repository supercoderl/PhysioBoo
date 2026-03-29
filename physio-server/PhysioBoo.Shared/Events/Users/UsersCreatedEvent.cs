namespace PhysioBoo.Shared.Events.Users
{
    public sealed class UsersCreatedEvent : DomainEvent
    {
        public Guid Id { get; }
        public string Type { get; }

        public UsersCreatedEvent(Guid id, string type) : base(id)
        {
            Id = id;
            Type = type;
        }
    }
}
