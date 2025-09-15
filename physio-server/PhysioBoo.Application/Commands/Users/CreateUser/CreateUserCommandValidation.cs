using FluentValidation;

namespace PhysioBoo.Application.Commands.Users.CreateUser
{
    public sealed class CreateUserCommandValidation : AbstractValidator<CreateUserCommand>
    {
        public CreateUserCommandValidation()
        {

        }
    }
}
