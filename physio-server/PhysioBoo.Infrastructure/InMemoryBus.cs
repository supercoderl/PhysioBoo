using MediatR;
using PhysioBoo.Domain.DomainEvents;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.EventHandlers;
using PhysioBoo.Shared.Events;
using PhysioBoo.SharedKenel.Commands;

namespace PhysioBoo.Infrastructure
{
    public sealed class InMemoryBus : IMediatorHandler
    {
        private readonly IMediator _mediator;
        private readonly IDomainEventStore _domainEventStore;
        private readonly IFanoutEventHandler _fanoutEventHandler;

        public InMemoryBus(
            IMediator mediator,
            IDomainEventStore domainEventStore,
            IFanoutEventHandler fanoutEventHandler
        )
        {
            _mediator = mediator;
            _domainEventStore = domainEventStore;
            _fanoutEventHandler = fanoutEventHandler;
        }

        public Task<TResponse> QueryAsync<TResponse>(IRequest<TResponse> query) => _mediator.Send(query);

        public async Task RaiseEventAsync<T>(T @event) where T : DomainEvent
        {
            await _domainEventStore.SaveAsync(@event);

            await _mediator.Publish(@event);

            await _fanoutEventHandler.HandleDomainEventAsync(@event);
        }

        public Task SendCommandAsync<T>(T command) where T : CommandBase => _mediator.Send(command);
    }
}
