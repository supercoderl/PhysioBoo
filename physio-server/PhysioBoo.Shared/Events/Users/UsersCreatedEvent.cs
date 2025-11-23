namespace PhysioBoo.Shared.Events.Users
{
    public sealed class UsersCreatedEvent : DomainEvent
    {
        public Guid Id { get; }
        public Guid? RoleId { get; }
        public string Type { get; }

        public UsersCreatedEvent(Guid id, Guid? roleId, string type) : base(id)
        {
            Id = id;
            RoleId = roleId;
            Type = type;
        }
    }
}
