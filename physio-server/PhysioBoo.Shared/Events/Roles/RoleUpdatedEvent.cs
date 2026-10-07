namespace PhysioBoo.Shared.Events.Roles
{
    public sealed class RoleUpdatedEvent : DomainEvent
    {
        public RoleUpdatedEvent(Guid aggregateId) : base(aggregateId)
        {

        }
    }
}
