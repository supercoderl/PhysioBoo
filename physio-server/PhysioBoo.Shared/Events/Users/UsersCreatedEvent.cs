namespace PhysioBoo.Shared.Events.Users
{
    public sealed class UsersCreatedEvent : DomainEvent
    {
        public Guid Id { get; }
        public string Role { get; }
        public string Type { get; }

        public UsersCreatedEvent(Guid id, string role, string type) : base(id)
        {
            Id = id;
            Role = role;
            Type = type;
        }
    }
}
