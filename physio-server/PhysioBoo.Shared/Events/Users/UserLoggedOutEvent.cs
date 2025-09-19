namespace PhysioBoo.Shared.Events.Users
{
    public sealed class UserLoggedOutEvent : DomainEvent
    {
        public UserLoggedOutEvent() : base(Guid.NewGuid())
        {

        }
    }
}
