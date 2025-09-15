using MassTransit;
using MediatR;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Shared.Events
{
    [ExcludeFromTopology]
    public abstract class DomainEvent : Message, INotification
    {
        public DateTime Timestamp { get; set; }

        protected DomainEvent(Guid aggregatedId) : base(aggregatedId)
        {
            Timestamp = TimeZoneHelper.GetLocalTimeNow();
        }

        protected DomainEvent(Guid aggregatedId, string? messageType) : base(aggregatedId, messageType)
        {
            Timestamp = TimeZoneHelper.GetLocalTimeNow();
        }
    }
}
