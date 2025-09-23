using MediatR;
using PhysioBoo.Application.ViewModels.Users;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Users.CreateUser
{
    public sealed class CreateUserCommand : CommandBase, IRequest
    {
        private static readonly CreateUserCommandValidation s_validation = new();

        public CreateUserViewModel NewUser { get; }

        public CreateUserCommand(CreateUserViewModel newUser) : base(newUser.Id)
        {
            NewUser = newUser;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
