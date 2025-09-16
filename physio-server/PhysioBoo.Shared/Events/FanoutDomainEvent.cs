using Newtonsoft.Json;

namespace PhysioBoo.Shared.Events
{
    public class FanoutDomainEvent : DomainEvent
    {
        public string EventType { get; }
        public Guid? UserId { get; }
        public string Payload { get; }

        [JsonConstructor]
        public FanoutDomainEvent(Guid aggregateId, string eventType, Guid? userId, string payload)
            : base(aggregateId)
        {
            EventType = eventType;
            UserId = userId;
            Payload = payload;
        }
    }
}
