using MediatR;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Users.ResendVerification
{
    public sealed class ResendVerificationCommand : CommandBase, IRequest
    {
        private static readonly ResendVerificationCommandValidation s_validation = new();

        public Guid UserId { get; }

        public ResendVerificationCommand(Guid userId) : base(Guid.NewGuid())
        {
            UserId = userId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
