
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.RetailCarts.ResumeCart
{
    public sealed class ResumeCartCommand : CommandBase, IRequest
    {
        private static readonly ResumeCartCommandValidation s_validation = new();

        public Guid CartId { get; }

        public ResumeCartCommand(Guid cartId) : base(Guid.NewGuid())
        {
            CartId = cartId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
