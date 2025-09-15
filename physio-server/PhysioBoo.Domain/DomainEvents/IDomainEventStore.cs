using PhysioBoo.Shared.Events;

namespace PhysioBoo.Domain.DomainEvents
{
    public interface IDomainEventStore
    {
        Task SaveAsync<T>(T domainEvent) where T : DomainEvent;
    }
}
