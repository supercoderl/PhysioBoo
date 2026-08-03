using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Patients.UpdatePatient
{
    public sealed class UpdatePatientCommandHandler : CommandHandlerBase, IRequestHandler<UpdatePatientCommand>
    {
        private readonly IPatientRepository _patientRepository;

        public UpdatePatientCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IPatientRepository patientRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _patientRepository = patientRepository;
        }

        public async Task Handle(UpdatePatientCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.PatientInformation.Patient? patient = await _patientRepository.GetByIdAsync(request.Id);

            if (patient == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Patient with Id {request.Id} not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            patient.SetPatientType(request.Patient.PatientType);
            patient.SetOccupation(request.Patient.Occupation);
            patient.SetAnnualIncomeRange(request.Patient.AnnualIncomeRange);
            patient.SetCommunicationPreferences(request.Patient.CommunicationPreferences);
            patient.SetInssuranceProvider(request.Patient.InssuranceProvider);
            patient.SetInssurancePolicyNumber(request.Patient.InssurancePolicyNumber);
            patient.SetInssuranceExpiryDate(request.Patient.InssuranceExpiryDate);
            patient.SetInssuranceCoverageAmount(request.Patient.InssuranceCoverageAmount);
            patient.SetMedicalHistory(request.Patient.MedicalHistory);
            patient.SetFamilyHistory(request.Patient.FamilyHistory);
            patient.SetSurgicalHistory(request.Patient.SurgicalHistory);
            patient.SetAllergyInformation(request.Patient.AllergyInformation);
            patient.SetCurrentMedications(request.Patient.CurrentMedications);
            patient.SetLifestyleNotes(request.Patient.LifestyleNotes);
            patient.SetIsVip(request.Patient.IsVip);
            patient.SetIsSeniorCitizen(request.Patient.IsSeniorCitizen);
            patient.SetIsChronicPatient(request.Patient.IsChronicPatient);
            patient.SetRiskLevel(request.Patient.RiskLevel);
            patient.SetPreferredHospitalId(request.Patient.PreferredHospitalId);
            patient.SetPreferredDoctorId(request.Patient.PreferredDoctorId);
            patient.SetPreferredAppointmentTime(request.Patient.PreferredAppointmentTime);
            patient.SetConsentForResearch(request.Patient.ConsentForResearch);
            patient.SetConsentForMarketing(request.Patient.ConsentForMarketing);
            patient.SetDataSharingConsent(request.Patient.DataSharingConsent);

            await _patientRepository.UpdateTrackedAsync(patient, ct);
        }
    }
}