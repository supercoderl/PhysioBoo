using PhysioBoo.Shared.Events;

namespace PhysioBoo.Domain.EventHandler.Fanout
{
    public interface IFanoutEventHandler
    {
        Task<T> HandleDomainEventAsync<T>(T @event) where T : DomainEvent;
    }
}
