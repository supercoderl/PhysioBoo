using MediatR;
using PhysioBoo.Application.ViewModels.Patients;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Queries.Patients.GetById
{
    public sealed class GetPatientByIdQueryHandler : IRequestHandler<GetPatientByIdQuery, PatientViewModel?>
    {
        private readonly IMediatorHandler _bus;
        private readonly IPatientRepository _patientRepository;

        public GetPatientByIdQueryHandler(
            IMediatorHandler bus,
            IPatientRepository patientRepository
        )
        {
            _bus = bus;
            _patientRepository = patientRepository;
        }

        public async Task<PatientViewModel?> Handle(GetPatientByIdQuery request, CancellationToken ct)
        {
            Patient? patient = await _patientRepository.GetByIdAsync(request.Id, includeProperties: "Profile,User", ct: ct);

            if (patient == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetPatientByIdQuery),
                    $"Patient with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));

                return null;
            }

            return PatientViewModel.FromPatient(patient);
        }
    }
}
