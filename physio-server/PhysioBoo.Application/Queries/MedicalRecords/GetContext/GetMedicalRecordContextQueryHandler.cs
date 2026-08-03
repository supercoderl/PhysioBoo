using MediatR;
using PhysioBoo.Application.ViewModels.MedicalRecords;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Queries.MedicalRecords.GetContext
{
    public sealed class GetMedicalRecordContextQueryHandler : IRequestHandler<GetMedicalRecordContextQuery, PatientContextViewModel?>
    {
        private readonly IPatientRepository _patientRepository;
        private readonly IMediatorHandler _bus;

        public GetMedicalRecordContextQueryHandler(
            IPatientRepository patientRepository,
            IMediatorHandler bus
        )
        {
            _patientRepository = patientRepository;
            _bus = bus;
        }

        public async Task<PatientContextViewModel?> Handle(GetMedicalRecordContextQuery request, CancellationToken ct)
        {
            Domain.Entities.PatientInformation.Patient? patient = await _patientRepository.GetByIdAsync(
                request.PatientId,
                "User.Profile,PrimaryDoctor.User.Profile,PrimaryDoctor.User.HeadedDepartments,Appointments"
            );

            if (patient == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetMedicalRecordContextQuery),
                    $"Patient with id {request.PatientId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));

                return null;
            }

            return PatientContextViewModel.FromEntity(patient);
        }
    }
}
