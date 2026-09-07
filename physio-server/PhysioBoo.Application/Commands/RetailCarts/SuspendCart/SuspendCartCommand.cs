
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.RetailCarts.SuspendCart
{
    public sealed class SuspendCartCommand : CommandBase, IRequest
    {
        private static readonly SuspendCartCommandValidation s_validation = new();

        public Guid CartId { get; }

        public SuspendCartCommand(Guid cartId) : base(Guid.NewGuid())
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
