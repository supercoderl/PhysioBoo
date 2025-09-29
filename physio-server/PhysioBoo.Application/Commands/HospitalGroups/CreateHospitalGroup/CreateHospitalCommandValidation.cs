using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.HospitalGroups.CreateHospitalGroup
{
    public sealed class CreateHospitalGroupCommandValidation : AbstractValidator<CreateHospitalGroupCommand>
    {
        public CreateHospitalGroupCommandValidation()
        {
            RuleForName();
        }

        public void RuleForName()
        {
            RuleFor(cmd => cmd.NewHospitalGroup.Name)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.HospitalGroup.EmptyName)
                .WithMessage("Name may not be empty.");
        }
    }
}
