namespace PhysioBoo.Shared.Events.Roles
{
    public sealed class RoleDeletedEvent : DomainEvent
    {
        public RoleDeletedEvent(Guid id) : base(id)
        {

        }
    }
}
