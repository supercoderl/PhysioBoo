using MassTransit;
using Microsoft.Extensions.Logging;
using PhysioBoo.Application.Commands.Media.DeleteFile;
using PhysioBoo.Application.Commands.Sys_Media.CreateMedia;
using PhysioBoo.Application.ViewModels.Sys_MediaFiles;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Shared.Events.MedicalSpecialties;

namespace PhysioBoo.Application.Consumers.MedicalSpecialties
{
    public sealed class MedicalSpecialtyUpdatedEventConsumer : IConsumer<MedicalSpecialtyUpdatedEvent>
    {
        private readonly ILogger<MedicalSpecialtyUpdatedEventConsumer> _logger;
        private readonly IMediatorHandler _bus;

        public MedicalSpecialtyUpdatedEventConsumer(ILogger<MedicalSpecialtyUpdatedEventConsumer> logger, IMediatorHandler bus)
        {
            _logger = logger;
            _bus = bus;
        }

        public async Task Consume(ConsumeContext<MedicalSpecialtyUpdatedEvent> context)
        {
            _logger.LogInformation(
                    "MedicalSpecialtyUpdatedEventConsumer handled for medical specialty {MedicalSpecialtyId}, CorrelationId {CorrelationId}",
                    context.Message.AggregateId, context.CorrelationId
                );

            bool isIconChanged = !string.Equals(context.Message.OldIconUrl, context.Message.NewIconUrl, StringComparison.OrdinalIgnoreCase);

            if (!isIconChanged) return;

            if (!string.IsNullOrEmpty(context.Message.OldIconUrl))
            {
                await _bus.SendCommandAsync(new DeleteFileCommand(context.Message.OldIconUrl));
            }

            if (!string.IsNullOrEmpty(context.Message.IconPublicId) && !string.IsNullOrEmpty(context.Message.NewIconUrl))
            {
                await _bus.SendCommandAsync(new CreateMediaCommand(
                    new CreateMediaViewModel(
                        Guid.NewGuid(),
                        context.Message.IconPublicId,
                        context.Message.NewIconUrl,
                        nameof(MedicalSpecialty),
                        context.Message.AggregateId
                    )
                ));
            }
        }
    }
}
