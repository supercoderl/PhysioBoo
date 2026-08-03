using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using PhysioBoo.Infrastructure.Database;
using PhysioBoo.Shared.Events;
using PhysioBoo.Shared.Events.Doctors;
using PhysioBoo.Shared.Events.MedicalSpecialties;
using PhysioBoo.Shared.Events.Users;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Infrastructure.Outbox
{
    public sealed class OutboxProcessor : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<OutboxProcessor> _logger;
        private readonly TimeSpan _interval = TimeSpan.FromSeconds(10);

        public OutboxProcessor(
            IServiceProvider serviceProvider,
            ILogger<OutboxProcessor> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Outbox Processor started");

            // Wait a bit on startup to let the app initialize
            await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessOutboxMessages(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing outbox messages");
                }

                await Task.Delay(_interval, stoppingToken);
            }

            _logger.LogInformation("Outbox Processor stopped");
        }

        private async Task ProcessOutboxMessages(CancellationToken ct)
        {
            using IServiceScope scope = _serviceProvider.CreateScope();
            ApplicationDbContext dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            IPublishEndpoint publishEndpoint = scope.ServiceProvider.GetRequiredService<IPublishEndpoint>();

            // Get unprocessed messages with retry limit
            List<OutboxMessage> messages = await dbContext.OutboxMessages
                .AsTracking()
                .Where(m => m.ProcessedOn == null && m.RetryCount < 5)
                .OrderBy(m => m.OccurredOn)
                .Take(20)
                .ToListAsync(ct);

            if (!messages.Any())
                return;

            _logger.LogInformation("Processing {Count} outbox messages", messages.Count);

            foreach (OutboxMessage? message in messages)
            {
                _logger.LogInformation(
                    "Processing outbox message {MessageId}, Type: {Type}, OccurredOn: {OccurredOn}, Content: {Content}",
                    message.Id,
                    message.Type,
                    message.OccurredOn,
                    message.Content
                );

                try
                {
                    // Deserialize the domain event
                    DomainEvent domainEvent = DeserializeEvent(message.Type, message.Content);

                    object? integrationEvent = ConvertToIntegrationEvent(domainEvent);

                    if (integrationEvent == null)
                    {
                        _logger.LogWarning("No integration event mapping found for {EventType}", message.Type);
                        message.ProcessedOn = TimeZoneHelper.GetLocalTimeNow();
                        continue;
                    }

                    await publishEndpoint.Publish(integrationEvent, ct);

                    // Mark as processed
                    message.ProcessedOn = TimeZoneHelper.GetLocalTimeNow();
                    message.Error = null;

                    _logger.LogInformation(
                        "Successfully processed outbox message {MessageId} of type {EventType}",
                        message.Id,
                        message.Type);
                }
                catch (Exception ex)
                {
                    message.RetryCount++;
                    message.Error = ex.Message;

                    _logger.LogError(
                        ex,
                        "Failed to process outbox message {MessageId} (Retry {RetryCount})",
                        message.Id,
                        message.RetryCount);

                    // If max retries reached, log as dead letter
                    if (message.RetryCount >= 5)
                    {
                        _logger.LogError(
                            "Outbox message {MessageId} has reached max retries and will be skipped",
                            message.Id);
                    }
                }
            }

            // Save all changes (processed status and retry counts)
            await dbContext.SaveChangesAsync(ct);
        }

        private object? ConvertToIntegrationEvent(DomainEvent domainEvent)
        {
            return domainEvent switch
            {
                // USER DOMAIN EVENT
                UsersCreatedEvent e => new UsersCreatedEvent(e.AggregateId, e.Type),
                EmailVerificationTokenGeneratedEvent e => new EmailVerificationTokenGeneratedEvent(
                    e.UserId,
                    e.Email,
                    e.Token,
                    e.ExpiresAt,
                    e.Type
                ),
                UserVerifiedEvent e => new UserVerifiedEvent(e.Token, e.Type),
                UserLoggedEvent e => new UserLoggedEvent(e.UserId, e.AccessToken, e.RefreshToken),

                // MEDICAL SPECIALTY EVENT
                MedicalSpecialtyCreatedEvent e => new MedicalSpecialtyCreatedEvent(e.AggregateId, e.IconPublicId, e.IconUrl),
                MedicalSpecialtyUpdatedEvent e => new MedicalSpecialtyUpdatedEvent(e.AggregateId, e.IconPublicId, e.NewIconUrl, e.OldIconUrl),

                // DOCTOR EVENT
                DoctorCreatedEvent e => new DoctorCreatedEvent(e.AggregateId),

                _ => null
            };
        }

        private DomainEvent DeserializeEvent(string eventType, string content)
        {
            // Use reflection to find the event type by name
            System.Reflection.Assembly[] assemblies = AppDomain.CurrentDomain.GetAssemblies();
            Type? type = assemblies
                .SelectMany(a => a.GetTypes())
                .FirstOrDefault(t =>
                    t.Name == eventType &&
                    typeof(DomainEvent).IsAssignableFrom(t) &&
                    !t.IsAbstract);

            if (type == null)
            {
                throw new InvalidOperationException($"Unknown event type: {eventType}");
            }

            DomainEvent? domainEvent = JsonConvert.DeserializeObject(content, type, new JsonSerializerSettings
            {
                TypeNameHandling = TypeNameHandling.All
            }) as DomainEvent;

            if (domainEvent == null)
            {
                throw new InvalidOperationException($"Failed to deserialize event: {eventType}");
            }

            return domainEvent;
        }
    }
}
