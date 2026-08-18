using FluentValidation;

namespace PhysioBoo.Application.Commands.Appointments.CompleteConsultation
{
    public sealed class CompleteConsultationCommandValidation : AbstractValidator<CompleteConsultationCommand>
    {
        public CompleteConsultationCommandValidation()
        {
            // TODO: Add your validation rules here
            // Example:
            // RuleFor(x => x.NewUser.Name)
            //     .NotEmpty()
            //     .WithMessage("Name is required");
        }
    }
}