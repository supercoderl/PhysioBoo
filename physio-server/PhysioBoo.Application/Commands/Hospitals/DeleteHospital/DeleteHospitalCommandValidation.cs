using FluentValidation;

namespace PhysioBoo.Application.Commands.Hospitals.DeleteHospital
{
    public sealed class DeleteHospitalCommandValidation : AbstractValidator<DeleteHospitalCommand>
    {
        public DeleteHospitalCommandValidation()
        {
            // TODO: Add your validation rules here
            // Example:
            // RuleFor(x => x.NewUser.Name)
            //     .NotEmpty()
            //     .WithMessage("Name is required");
        }
    }
}