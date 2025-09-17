using FluentValidation;

namespace PhysioBoo.Application.Commands.Users.UpdateUser
{
    public sealed class UpdateUserCommandValidation : AbstractValidator<UpdateUserCommand>
    {
        public UpdateUserCommandValidation()
        {

        }
    }
}
