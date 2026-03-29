using MediatR;
using PhysioBoo.Application.ViewModels.Doctors;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Queries.Doctors.GetById
{
    public sealed class GetDoctorByIdQueryHandler : IRequestHandler<GetDoctorByIdQuery, DoctorViewModel?>
    {
        private readonly IMediatorHandler _bus;
        private readonly IDoctorRepository _doctorRepository;

        public GetDoctorByIdQueryHandler(
            IMediatorHandler bus,
            IDoctorRepository doctorRepository
        )
        {
            _bus = bus;
            _doctorRepository = doctorRepository;
        }

        public async Task<DoctorViewModel?> Handle(GetDoctorByIdQuery request, CancellationToken cancellationToken)
        {
            Doctor? doctor = await _doctorRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken);

            if (doctor == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetDoctorByIdQuery),
                    $"Doctor with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));

                return null;
            }

            return DoctorViewModel.FromDoctor(doctor);
        }
    }
}
