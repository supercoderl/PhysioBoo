using MassTransit;
using Microsoft.Extensions.Logging;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Shared.Events.Users;

namespace PhysioBoo.Application.Consumers.Users
{
    public sealed class UserAssignRoleConsumer : IConsumer<UsersCreatedEvent>
    {
        private readonly ILogger<UserAssignRoleConsumer> _logger;
        private readonly IMediatorHandler _bus;

        public UserAssignRoleConsumer(
            ILogger<UserAssignRoleConsumer> logger,
            IMediatorHandler bus)
        {
            _logger = logger;
            _bus = bus;
        }

        public async Task Consume(ConsumeContext<UsersCreatedEvent> context)
        {
            UsersCreatedEvent evt = context.Message;

            _logger.LogInformation(
                "[UserAssignRoleConsumer] Assigning default role to User {UserId}",
                evt.AggregateId
            );

            await Task.CompletedTask;
        }
    }
}
