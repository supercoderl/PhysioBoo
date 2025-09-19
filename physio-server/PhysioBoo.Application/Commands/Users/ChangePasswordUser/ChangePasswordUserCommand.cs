using MediatR;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Users.ChangePasswordUser
{
    public sealed class ChangePasswordUserCommand : CommandBase, IRequest
    {
        private static readonly ChangePasswordUserCommandValidation s_validation = new();

        public Guid Id { get; }
        public string OldPassword { get; }
        public string NewPassword { get; }

        public ChangePasswordUserCommand(Guid id, string oldPassword, string newPassword) : base(Guid.NewGuid())
        {
            Id = id;
            OldPassword = oldPassword;
            NewPassword = newPassword;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
