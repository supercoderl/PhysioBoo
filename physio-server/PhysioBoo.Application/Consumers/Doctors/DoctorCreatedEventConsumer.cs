using MassTransit;
using Microsoft.Extensions.Logging;
using PhysioBoo.Application.Commands.Users.GenerateEmailVerificationToken;
using PhysioBoo.Application.ViewModels.VerificationTokens;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Shared.Events.Doctors;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Consumers.Doctors
{
    public sealed class DoctorCreatedEventConsumer : IConsumer<DoctorCreatedEvent>
    {
        private readonly ILogger<DoctorCreatedEventConsumer> _logger;
        private readonly IMediatorHandler _bus;

        public DoctorCreatedEventConsumer(ILogger<DoctorCreatedEventConsumer> logger, IMediatorHandler bus)
        {
            _logger = logger;
            _bus = bus;
        }

        public async Task Consume(ConsumeContext<DoctorCreatedEvent> context)
        {
            _logger.LogInformation(
                    "DoctorCreatedEventConsumer handled for Doctor {DoctorId}, CorrelationId {CorrelationId}",
                    context.Message.AggregateId, context.CorrelationId
                );

            await _bus.SendCommandAsync(new GenerateEmailVerificationTokenCommand(
                new CreateVerificationTokenViewModel(
                    Guid.NewGuid(),
                    context.Message.AggregateId,
                    TokenHelper.GenerateTimestampedToken(24),
                    TimeZoneHelper.GetLocalTimeNow().AddMinutes(15),
                    VerificationType.Email
            )));
        }
    }
}
