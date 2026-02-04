using MassTransit;
using Microsoft.Extensions.Logging;
using PhysioBoo.Application.Commands.Sys_Media.CreateMedia;
using PhysioBoo.Application.ViewModels.Sys_MediaFiles;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Shared.Events.MedicalSpecialties;

namespace PhysioBoo.Application.Consumers.MedicalSpecialties
{
    public sealed class MedicalSpecialtyCreatedEventConsumer : IConsumer<MedicalSpecialtyCreatedEvent>
    {
        private readonly ILogger<MedicalSpecialtyCreatedEventConsumer> _logger;
        private readonly IMediatorHandler _bus;

        public MedicalSpecialtyCreatedEventConsumer(ILogger<MedicalSpecialtyCreatedEventConsumer> logger, IMediatorHandler bus)
        {
            _logger = logger;
            _bus = bus;
        }

        public async Task Consume(ConsumeContext<MedicalSpecialtyCreatedEvent> context)
        {
            _logger.LogInformation(
                    "MedicalSpecialtyCreatedEventConsumer handled for medical specialty {MedicalSpecialtyId}, CorrelationId {CorrelationId}",
                    context.Message.AggregateId, context.CorrelationId
                );

            if (!string.IsNullOrEmpty(context.Message.IconPublicId) && !string.IsNullOrEmpty(context.Message.IconUrl))
            {
                await _bus.SendCommandAsync(new CreateMediaCommand(
                    new CreateMediaViewModel(
                        Guid.NewGuid(),
                        context.Message.IconPublicId,
                        context.Message.IconUrl,
                        nameof(MedicalSpecialty),
                        context.Message.AggregateId
                    )
                ));
            }
        }
    }
}
