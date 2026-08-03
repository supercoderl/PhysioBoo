using MediatR;
using PhysioBoo.Application.ViewModels.MedicalSpecialties;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Queries.MedicalSpecialties.GetById
{
    public sealed class GetMedicalSpecialtyByIdQueryHandler : IRequestHandler<GetMedicalSpecialtyByIdQuery, MedicalSpecialtyViewModel?>
    {
        private readonly IMediatorHandler _bus;
        private readonly IMedicalSpecialtyRepository _medicalSpecialtyRepository;

        public GetMedicalSpecialtyByIdQueryHandler(
            IMediatorHandler bus,
            IMedicalSpecialtyRepository medicalSpecialtyRepository
        )
        {
            _bus = bus;
            _medicalSpecialtyRepository = medicalSpecialtyRepository;
        }

        public async Task<MedicalSpecialtyViewModel?> Handle(GetMedicalSpecialtyByIdQuery request, CancellationToken ct)
        {
            MedicalSpecialty? medicalSpecialty = await _medicalSpecialtyRepository.GetByIdAsync(request.Id, ct: ct);

            if (medicalSpecialty == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetMedicalSpecialtyByIdQuery),
                    $"Medical specialty with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));

                return null;
            }

            return MedicalSpecialtyViewModel.FromMedicalSpecialty(medicalSpecialty);
        }
    }
}
