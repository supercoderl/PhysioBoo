using MediatR;
using PhysioBoo.Application.ViewModels.Users;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Users.UpdateUser
{
    public sealed class UpdateUserCommand : CommandBase, IRequest
    {
        private static readonly UpdateUserCommandValidation s_validation = new();

        public Guid Id { get; }
        public UpdateUserViewModel UpdateUserData { get; }

        public UpdateUserCommand(Guid id, UpdateUserViewModel updateUserData) : base(Guid.NewGuid())
        {
            Id = id;
            UpdateUserData = updateUserData;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
