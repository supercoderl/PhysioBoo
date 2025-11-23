using Newtonsoft.Json;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Infrastructure.Database;
using PhysioBoo.Infrastructure.Outbox;
using PhysioBoo.Shared.Events;

namespace PhysioBoo.Infrastructure.Repositories
{
    public sealed class OutboxRepository : IOutboxRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IUser _user;

        public OutboxRepository(ApplicationDbContext context, IUser user)
        {
            _context = context;
            _user = user;
        }

        public async Task SaveEventToOutboxAsync<T>(T @event) where T : DomainEvent
        {
            OutboxMessage outboxMessage = new OutboxMessage
            {
                Id = Guid.NewGuid(),
                Type = @event.GetType().Name,
                Content = JsonConvert.SerializeObject(@event, new JsonSerializerSettings
                {
                    TypeNameHandling = TypeNameHandling.All
                }),
                OccurredOn = @event.Timestamp,
                AggregateId = @event.AggregateId,
                UserId = _user.GetUserId().ToString()
            };

            await _context.OutboxMessages.AddAsync(outboxMessage);
            await _context.SaveChangesAsync();
        }
    }
}
