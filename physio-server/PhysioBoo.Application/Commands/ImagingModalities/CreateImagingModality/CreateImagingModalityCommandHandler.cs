using MediatR;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.ImagingModalities.CreateImagingModality
{
    public sealed class CreateImagingModalityCommandHandler : CommandHandlerBase, IRequestHandler<CreateImagingModalityCommand>
    {
        private readonly IImagingModalityRepository _imagingModalityRepository;

        public CreateImagingModalityCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IImagingModalityRepository imagingModalityRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _imagingModalityRepository = imagingModalityRepository;
        }

        public async Task Handle(CreateImagingModalityCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var result = await _imagingModalityRepository.InsertAsync<ImagingModality, Guid>(new ImagingModality(
                request.NewImagingModality.Id,
                request.NewImagingModality.Name,
                request.NewImagingModality.Code,
                request.NewImagingModality.Description,
                request.NewImagingModality.Category,
                request.NewImagingModality.PreparationInstructions,
                request.NewImagingModality.RadiationDose
            ));

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try gain. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));

                return;
            }
        }
    }
}
