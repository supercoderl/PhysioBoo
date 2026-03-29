using FluentValidation;

namespace PhysioBoo.Application.Commands.Doctors.DeleteDoctor
{
    public sealed class DeleteDoctorCommandValidation : AbstractValidator<DeleteDoctorCommand>
    {
        public DeleteDoctorCommandValidation()
        {
            // TODO: Add your validation rules here
            // Example:
            // RuleFor(x => x.NewUser.Name)
            //     .NotEmpty()
            //     .WithMessage("Name is required");
        }
    }
}