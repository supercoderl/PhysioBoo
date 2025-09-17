using FluentValidation.Results;
using MediatR;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.SharedKernel.Commands
{
    public abstract class CommandBase : IRequest
    {
        public Guid AggregateId { get; }
        public string MessageType { get; }
        public DateTime Timestamp { get; }
        public ValidationResult? ValidationResult { get; protected set; }

        protected CommandBase(Guid aggregateId)
        {
            MessageType = GetType().Name;
            Timestamp = TimeZoneHelper.GetLocalTimeNow();
            AggregateId = aggregateId;
        }

        public abstract bool IsValid();
    }
}
