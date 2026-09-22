using PhysioBoo.Application.ViewModels.MedicalServices;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.MedicalServices.GetById
{
    public sealed class GetMedicalServiceByIdQueryHandler : IRequestHandler<GetMedicalServiceByIdQuery, MedicalServiceViewModel?>
    {
        private readonly IMediatorHandler _bus;
        private readonly IMedicalServiceRepository _medicalServiceRepository;

        public GetMedicalServiceByIdQueryHandler(
            IMediatorHandler bus,
            IMedicalServiceRepository medicalServiceRepository
        )
        {
            _bus = bus;
            _medicalServiceRepository = medicalServiceRepository;
        }

        public async Task<MedicalServiceViewModel?> Handle(GetMedicalServiceByIdQuery request, CancellationToken ct)
        {
            MedicalService? medicalService = await _medicalServiceRepository.GetWithLinksAsync(request.Id, ct);

            if (medicalService == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetMedicalServiceByIdQuery),
                    $"Medical service with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));

                return null;
            }

            return MedicalServiceViewModel.FromEntity(medicalService);
        }
    }
}
