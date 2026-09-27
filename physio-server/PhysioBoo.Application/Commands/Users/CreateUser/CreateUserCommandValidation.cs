using PhysioBoo.Application.Extensions.Validation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Users.CreateUser
{
    public sealed class CreateUserCommandValidation : AbstractValidator<CreateUserCommand>
    {
        public CreateUserCommandValidation()
        {
            RuleForNewId();
            RuleForEmail();
            RuleForPhone();
            RuleForPassword();
            RuleForRole();
        }

        public void RuleForNewId()
        {
            RuleFor(cmd => cmd.NewId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.User.EmptyId)
                .WithMessage("Id may not be empty.");
        }

        public void RuleForEmail()
        {
            RuleFor(cmd => cmd.NewUser.Email)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.User.EmptyEmail)
                .WithMessage("Email may not be empty.")
                .MaximumLength(255)
                .WithErrorCode(DomainErrorCodes.User.EmailExceedsMaxLength)
                .WithMessage("Email may not be longer than 255 characters.")
                .EmailAddress()
                .WithErrorCode(DomainErrorCodes.User.InvalidEmail)
                .WithMessage("Email is not a valid email address.");
        }

        public void RuleForPhone()
        {
            RuleFor(cmd => cmd.NewUser.Phone)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.User.EmptyPhone)
                .WithMessage("Phone may not be empty.")
                .MaximumLength(20)
                .WithErrorCode(DomainErrorCodes.User.PhoneExceedsMaxLength)
                .WithMessage("Phone may not be longer than 20 characters.")
                .PhoneNumber()
                .WithErrorCode(DomainErrorCodes.User.InvalidPhone)
                .WithMessage("Phone is not a valid phone number.");
        }

        public void RuleForPassword()
        {
            RuleFor(cmd => cmd.NewUser.Password).Password();
        }

        public void RuleForRole()
        {
            RuleFor(cmd => cmd.NewUser.Role)
                .IsInEnum()
                .WithErrorCode(DomainErrorCodes.User.InvalidRole)
                .WithMessage("Role is invalid.");
        }
    }
}
