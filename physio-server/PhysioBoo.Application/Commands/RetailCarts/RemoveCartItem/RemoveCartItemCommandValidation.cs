

namespace PhysioBoo.Application.Commands.RetailCarts.RemoveCartItem
{
    public sealed class RemoveCartItemCommandValidation : AbstractValidator<RemoveCartItemCommand>
    {
        public RemoveCartItemCommandValidation()
        {
            RuleFor(cmd => cmd.CartId).NotEmpty();
            RuleFor(cmd => cmd.LineItemId).NotEmpty();
        }
    }
}
