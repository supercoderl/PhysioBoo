using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Users.DeleteUser
{
    public sealed class DeleteUserCommandValidation : AbstractValidator<DeleteUserCommand>
    {
        public DeleteUserCommandValidation()
        {
            RuleForId();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.User.EmptyId)
                .WithMessage("Id may not be empty.");
        }
    }
}
