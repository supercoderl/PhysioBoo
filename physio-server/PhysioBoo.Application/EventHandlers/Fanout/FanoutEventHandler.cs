using MassTransit;
using Newtonsoft.Json;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.EventHandlers;
using PhysioBoo.Shared.Events;

namespace PhysioBoo.Application.EventHandlers.Fanout
{
    public sealed class FanoutEventHandler : IFanoutEventHandler
    {
        private readonly IPublishEndpoint _massTransit;
        private readonly IUser _user;

        public FanoutEventHandler(IPublishEndpoint massTransit, IUser user)
        {
            _massTransit = massTransit;
            _user = user;
        }

        public async Task<T> HandleDomainEventAsync<T>(T @event) where T : DomainEvent
        {
            var fanoutDomainEvent =
                new FanoutDomainEvent(
                    @event.AggregateId,
                    @event.GetType().Name,
                    _user.GetUserId(),
                    JsonConvert.SerializeObject(@event)
                );

            await _massTransit.Publish(fanoutDomainEvent);
            await _massTransit.Publish(@event);

            return @event;
        }
    }
}
