using MediatR;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Users.ResendVerification
{
    public sealed class ResendVerificationCommand : CommandBase, IRequest
    {
        private static readonly ResendVerificationCommandValidation s_validation = new();

        public Guid UserId { get; }
        public VerificationType VerificationType { get; }

        public ResendVerificationCommand(Guid userId, VerificationType verificationType) : base(Guid.NewGuid())
        {
            UserId = userId;
            VerificationType = verificationType;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
