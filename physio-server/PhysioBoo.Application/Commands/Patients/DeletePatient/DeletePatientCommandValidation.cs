using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Patients.DeletePatient
{
    public sealed class DeletePatientCommandValidation : AbstractValidator<DeletePatientCommand>
    {
        public DeletePatientCommandValidation()
        {
            RuleForId();
        }

        public void RuleForId()
        {
            RuleFor(x => x.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Patient.EmptyId)
                .WithMessage("Id may not be empty.");
        }
    }
}