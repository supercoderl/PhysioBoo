namespace PhysioBoo.Shared.Events.Users
{
    public sealed class UserUpdatedEvent : DomainEvent
    {
        public Guid Id { get; }

        public UserUpdatedEvent(Guid id) : base(id)
        {
            Id = id;
        }
    }
}
