using MediatR;
using PhysioBoo.Application.ViewModels.MedicalRecords;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Queries.MedicalRecords.GetPatientDemoGraphics
{
    public sealed class GetMedicalRecordPatientDemoGraphicsQueryHandler : IRequestHandler<GetMedicalRecordPatientDemoGraphicsQuery, PatientDemographicsViewModel?>
    {
        private readonly IPatientRepository _patientRepository;
        private readonly IMediatorHandler _bus;

        public GetMedicalRecordPatientDemoGraphicsQueryHandler(
            IPatientRepository patientRepository,
            IMediatorHandler bus
        )
        {
            _patientRepository = patientRepository;
            _bus = bus;
        }

        public async Task<PatientDemographicsViewModel?> Handle(GetMedicalRecordPatientDemoGraphicsQuery request, CancellationToken cancellationToken)
        {
            Domain.Entities.PatientInformation.Patient? patient = await _patientRepository.GetByIdAsync(request.PatientId);

            if (patient == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetMedicalRecordPatientDemoGraphicsQuery),
                    $"Patient with id {request.PatientId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));

                return null;
            }

            return PatientDemographicsViewModel.FromPatient(patient);
        }
    }
}
