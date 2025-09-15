namespace PhysioBoo.Shared.Events
{
    public class FanoutDomainEvent : DomainEvent
    {
        public DomainEvent DomainEvent;
        public Guid? UserId;

        public FanoutDomainEvent(Guid aggregateId, DomainEvent domainEvent, Guid? userId) : base(aggregateId)
        {
            DomainEvent = domainEvent;
            UserId = userId;
        }
    }
}
