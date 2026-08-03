using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.ImagingModalities.UpdateImagingModality
{
    public sealed class UpdateImagingModalityCommandHandler : CommandHandlerBase, IRequestHandler<UpdateImagingModalityCommand>
    {
        private readonly IImagingModalityRepository _imagingModalityRepository;

        public UpdateImagingModalityCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IImagingModalityRepository imagingModalityRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _imagingModalityRepository = imagingModalityRepository;
        }

        public async Task Handle(UpdateImagingModalityCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.LaboratoryImaging.ImagingModality? imagingModality = await _imagingModalityRepository.GetByIdAsync(request.Id);

            if (imagingModality == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Imaging modality with Id {request.Id} not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            imagingModality.SetName(request.ImagingModality.Name);
            imagingModality.SetCode(request.ImagingModality.Code);
            imagingModality.SetDescription(request.ImagingModality.Description);
            imagingModality.SetCategory(request.ImagingModality.Category);
            imagingModality.SetRequiresContrast(request.ImagingModality.RequiresContrast);
            imagingModality.SetPreparationRequired(request.ImagingModality.PreparationRequired);
            imagingModality.SetPreparationInstructions(request.ImagingModality.PreparationInstructions);
            imagingModality.SetAverageDurationMinutes(request.ImagingModality.AverageDurationMinutes);
            imagingModality.SetRadiationDose(request.ImagingModality.RadiationDose);
            imagingModality.SetIsActive(request.ImagingModality.IsActive);

            await _imagingModalityRepository.UpdateTrackedAsync(imagingModality, ct);
        }
    }
}
