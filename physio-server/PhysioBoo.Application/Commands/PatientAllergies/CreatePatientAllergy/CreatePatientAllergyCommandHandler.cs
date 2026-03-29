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
        private readonly IUser _user;

        public CreatePatientAllergyCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IPatientAllergyRepository patientAllergyRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _patientAllergyRepository = patientAllergyRepository;
            _user = user;
        }

        public async Task Handle(CreatePatientAllergyCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            PatientAllergy newPatientAllergy = new PatientAllergy(
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
            );

            newPatientAllergy.SetTenantId(_user.GetTenantId());
            newPatientAllergy.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _patientAllergyRepository.InsertAsync<PatientAllergy, Guid>(newPatientAllergy);

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
