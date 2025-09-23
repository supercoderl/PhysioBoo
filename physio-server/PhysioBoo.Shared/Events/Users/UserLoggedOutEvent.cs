namespace PhysioBoo.Shared.Events.Users
{
    public sealed class UserLoggedOutEvent : DomainEvent
    {
        public Guid Id { get; }
        public UserLoggedOutEvent(Guid id) : base(id)
        {
            Id = id;
        }
    }
}
