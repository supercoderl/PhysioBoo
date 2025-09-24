using MediatR;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.PatientAllergies.CreatePatientAllergy
{
    public sealed class CreatePatientAllergyCommandHandler : CommandHandlerBase, IRequestHandler<CreatePatientAllergyCommand>
    {
        private readonly IPatientAllergyRepository _patientAllergyRepository;

        public CreatePatientAllergyCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IPatientAllergyRepository patientAllergyRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _patientAllergyRepository = patientAllergyRepository;
        }

        public async Task Handle(CreatePatientAllergyCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var result = await _patientAllergyRepository.InsertAsync<PatientAllergy, Guid>(new PatientAllergy(
                request.NewPatientAllergy.Id,
                request.NewPatientAllergy.PatientId,
                request.NewPatientAllergy.AllergenName,
                request.NewPatientAllergy.AllergenType,
                request.NewPatientAllergy.ReactionType,
                request.NewPatientAllergy.Severity,
                request.NewPatientAllergy.FirstOccurenceDate,
                request.NewPatientAllergy.LastOccurenceDate,
                request.NewPatientAllergy.TreatmentGiven,
                request.NewPatientAllergy.Notes
            ));

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));

                return;
            }
        }
    }
}
