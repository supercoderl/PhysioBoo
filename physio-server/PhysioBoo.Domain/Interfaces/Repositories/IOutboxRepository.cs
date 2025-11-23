using PhysioBoo.Shared.Events;

namespace PhysioBoo.Domain.Interfaces.Repositories
{
    public interface IOutboxRepository
    {
        Task SaveEventToOutboxAsync<T>(T @event) where T : DomainEvent;
    }
}
