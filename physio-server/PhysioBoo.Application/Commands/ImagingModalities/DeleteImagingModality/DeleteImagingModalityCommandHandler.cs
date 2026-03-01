using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.ImagingModalities.DeleteImagingModality
{
    public sealed class DeleteImagingModalityCommandHandler : CommandHandlerBase, IRequestHandler<DeleteImagingModalityCommand>
    {
        private readonly IImagingModalityRepository _imagingModalityRepository;

        public DeleteImagingModalityCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IImagingModalityRepository imagingModalityRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _imagingModalityRepository = imagingModalityRepository;
        }

        public async Task Handle(DeleteImagingModalityCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.LaboratoryImaging.ImagingModality? ImagingModality = await _imagingModalityRepository.GetByIdAsync(request.Id);

            if (ImagingModality == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Imaging modality is not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            _imagingModalityRepository.SoftDeleteSingle(
                ImagingModality,
                request.IsHard,
                cancellationToken
            );

            await CommitAsync();
        }
    }
}
