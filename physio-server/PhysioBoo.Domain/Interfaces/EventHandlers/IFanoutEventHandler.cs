using PhysioBoo.Shared.Events;

namespace PhysioBoo.Domain.Interfaces.EventHandlers
{
    public interface IFanoutEventHandler
    {
        Task<T> HandleDomainEventAsync<T>(T @event) where T : DomainEvent;
    }
}
