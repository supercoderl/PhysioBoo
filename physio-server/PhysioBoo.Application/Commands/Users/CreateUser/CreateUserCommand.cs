using MediatR;
using PhysioBoo.Application.ViewModels.Users;
using PhysioBoo.SharedKenel.Commands;

namespace PhysioBoo.Application.Commands.Users.CreateUser
{
    public sealed class CreateUserCommand : CommandBase, IRequest
    {
        private static readonly CreateUserCommandValidation s_validation = new();

        public List<CreateUserViewModel> NewListUsers { get; }

        public CreateUserCommand(
            List<CreateUserViewModel> newListUsers
        ) : base(Guid.NewGuid())
        {
            NewListUsers = newListUsers;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
