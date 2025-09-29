using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.DoctorAwards.CreateDoctorAward
{
    public sealed class CreateDoctorAwardCommandValidation : AbstractValidator<CreateDoctorAwardCommand>
    {
        public CreateDoctorAwardCommandValidation()
        {
            RuleForDoctorId();
            RuleForAwardName();
        }

        public void RuleForDoctorId()
        {
            RuleFor(cmd => cmd.NewDoctorAward.DoctorId).NotEmpty().WithErrorCode(DomainErrorCodes.DoctorAward.EmptyDoctorId).WithMessage("Doctor id may not be empty.");
        }

        public void RuleForAwardName()
        {
            RuleFor(cmd => cmd.NewDoctorAward.AwardName).NotEmpty().WithErrorCode(DomainErrorCodes.DoctorAward.EmptyAwardName).WithMessage("Award name may not be empty.");
        }
    }
}
