namespace PhysioBoo.Shared.Events.Roles
{
    public sealed class RoleCreatedEvent : DomainEvent
    {
        public RoleCreatedEvent(Guid aggregateId) : base(aggregateId)
        {

        }
    }
}
