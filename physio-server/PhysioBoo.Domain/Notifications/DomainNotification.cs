using PhysioBoo.Shared.Events;

namespace PhysioBoo.Domain.Notifications
{
    public class DomainNotification : DomainEvent
    {
        public string Key { get; }
        public string Value { get; }
        public string Code { get; }
        public object? Data { get; }
        public int Version { get; private set; } = 1;

        public DomainNotification(
            string key,
            string value,
            string code,
            object? data = null,
            Guid? aggregatedId = null
        ) : base(aggregatedId ?? Guid.NewGuid())
        {
            Key = key ?? throw new ArgumentException(nameof(key));
            Value = value ?? throw new ArgumentException(nameof(value));
            Code = code ?? throw new ArgumentException(nameof(code));
            Data = data;
        }
    }
}
