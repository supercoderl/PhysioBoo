using FluentValidation;

namespace PhysioBoo.Application.Commands.Patients.InvitePatient
{
    public sealed class InvitePatientToPortalCommandValidation : AbstractValidator<InvitePatientToPortalCommand>
    {
        public InvitePatientToPortalCommandValidation()
        {
            // TODO: Add your validation rules here
            // Example:
            // RuleFor(x => x.NewUser.Name)
            //     .NotEmpty()
            //     .WithMessage("Name is required");
        }
    }
}