namespace PhysioBoo.Shared.Events.Users
{
    public sealed class UserUpdatedEvent : DomainEvent
    {
        public UserUpdatedEvent(Guid id) : base(id)
        {

        }
    }
}
