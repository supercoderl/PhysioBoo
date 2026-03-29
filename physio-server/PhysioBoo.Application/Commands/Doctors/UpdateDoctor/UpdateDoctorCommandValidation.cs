using FluentValidation;

namespace PhysioBoo.Application.Commands.Doctors.UpdateDoctor
{
    public sealed class UpdateDoctorCommandValidation : AbstractValidator<UpdateDoctorCommand>
    {
        public UpdateDoctorCommandValidation()
        {
            // TODO: Add your validation rules here
            // Example:
            // RuleFor(x => x.NewUser.Name)
            //     .NotEmpty()
            //     .WithMessage("Name is required");
        }
    }
}