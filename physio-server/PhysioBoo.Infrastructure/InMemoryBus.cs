using MediatR;
using PhysioBoo.Domain.DomainEvents;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Shared.Events;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Infrastructure
{
    public sealed class InMemoryBus : IMediatorHandler
    {
        private readonly IMediator _mediator;
        private readonly IDomainEventStore _domainEventStore;
        private readonly IOutboxRepository _outboxRepository;

        public InMemoryBus(
            IMediator mediator,
            IDomainEventStore domainEventStore,
            IOutboxRepository outboxRepository
        )
        {
            _mediator = mediator;
            _domainEventStore = domainEventStore;
            _outboxRepository = outboxRepository;
        }

        public Task<TResponse> QueryAsync<TResponse>(IRequest<TResponse> query) => _mediator.Send(query);

        public async Task RaiseEventAsync<T>(T @event) where T : DomainEvent
        {
            await _domainEventStore.SaveAsync(@event);

            await _outboxRepository.SaveEventToOutboxAsync(@event);
        }

        public Task SendCommandAsync<T>(T command) where T : CommandBase => _mediator.Send(command);
    }
}
