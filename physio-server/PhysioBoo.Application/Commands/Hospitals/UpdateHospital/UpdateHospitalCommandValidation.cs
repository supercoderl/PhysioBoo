using FluentValidation;

namespace PhysioBoo.Application.Commands.Hospitals.UpdateHospital
{
    public sealed class UpdateHospitalCommandValidation : AbstractValidator<UpdateHospitalCommand>
    {
        public UpdateHospitalCommandValidation()
        {
            // TODO: Add your validation rules here
            // Example:
            // RuleFor(x => x.NewUser.Name)
            //     .NotEmpty()
            //     .WithMessage("Name is required");
        }
    }
}