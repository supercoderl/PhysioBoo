using MediatR;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Users.UpdateUser
{
    public sealed class UpdateUserCommand : CommandBase, IRequest
    {
        private static readonly UpdateUserCommandValidation s_validation = new();

        public Guid Id { get; }
        public object UpdateUserData { get; }

        public UpdateUserCommand(Guid id, object updateUserData) : base(Guid.NewGuid())
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
