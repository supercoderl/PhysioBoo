using MediatR;

namespace PhysioBoo.Shared.Events
{
    public abstract class Message : IRequest
    {
        public Guid AggregateId { get; set; }
        public string MessageType { get; set; }

        protected Message(Guid aggregateId)
        {
            AggregateId = aggregateId;
            MessageType = GetType().Name;
        }

        protected Message(Guid aggregateId, string? messageType)
        {
            AggregateId = aggregateId;
            MessageType = messageType ?? string.Empty;
        }
    }
}
