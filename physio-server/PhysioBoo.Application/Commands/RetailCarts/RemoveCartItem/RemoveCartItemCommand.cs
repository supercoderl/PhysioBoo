
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.RetailCarts.RemoveCartItem
{
    public sealed class RemoveCartItemCommand : CommandBase, IRequest
    {
        private static readonly RemoveCartItemCommandValidation s_validation = new();

        public Guid CartId { get; }
        public Guid LineItemId { get; }

        public RemoveCartItemCommand(Guid cartId, Guid lineItemId) : base(Guid.NewGuid())
        {
            CartId = cartId;
            LineItemId = lineItemId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
