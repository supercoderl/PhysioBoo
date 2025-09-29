using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Profiles.CreateProfile
{
    public sealed class CreateProfileCommandValidation : AbstractValidator<CreateProfileCommand>
    {
        public CreateProfileCommandValidation()
        {
            RuleForFirstName();
            RuleForLastName();
            RuleForMiddleName();
        }

        public void RuleForFirstName() =>
            RuleFor(cmd => cmd.NewProfile.FirstName).NotEmpty()
                .WithErrorCode(DomainErrorCodes.Profile.EmptyFirstName)
                .WithMessage("FirstName may not be empty.");

        public void RuleForLastName() =>
            RuleFor(cmd => cmd.NewProfile.LastName).NotEmpty()
                .WithErrorCode(DomainErrorCodes.Profile.EmptyLastName)
                .WithMessage("LastName may not be empty.");

        public void RuleForMiddleName() =>
            RuleFor(cmd => cmd.NewProfile.MiddleName).NotEmpty()
                .WithErrorCode(DomainErrorCodes.Profile.EmptyMiddleName)
                .WithMessage("MiddleName may not be empty.");
    }
}
