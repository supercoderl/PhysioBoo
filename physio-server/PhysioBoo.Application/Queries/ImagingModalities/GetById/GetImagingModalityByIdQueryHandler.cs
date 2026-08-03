using MediatR;
using PhysioBoo.Application.ViewModels.ImagingModalities;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Queries.ImagingModalities.GetById
{
    public sealed class GetImagingModalityByIdQueryHandler : IRequestHandler<GetImagingModalityByIdQuery, ImagingModalityViewModel?>
    {
        private readonly IMediatorHandler _bus;
        private readonly IImagingModalityRepository _imagingModalityRepository;

        public GetImagingModalityByIdQueryHandler(
            IMediatorHandler bus,
            IImagingModalityRepository imagingModalityRepository
        )
        {
            _bus = bus;
            _imagingModalityRepository = imagingModalityRepository;
        }

        public async Task<ImagingModalityViewModel?> Handle(GetImagingModalityByIdQuery request, CancellationToken ct)
        {
            ImagingModality? imagingModality = await _imagingModalityRepository.GetByIdAsync(request.Id, ct: ct);

            if (imagingModality == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetImagingModalityByIdQuery),
                    $"Imaging modality with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));

                return null;
            }

            return ImagingModalityViewModel.FromImagingModality(imagingModality);
        }
    }
}
