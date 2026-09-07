

namespace PhysioBoo.Application.Commands.RetailCarts.UpsertCartItem
{
    public sealed class UpsertCartItemCommandValidation : AbstractValidator<UpsertCartItemCommand>
    {
        public UpsertCartItemCommandValidation()
        {
            RuleFor(cmd => cmd.CartId).NotEmpty();
            RuleFor(cmd => cmd.MedicineId).NotEmpty();
            RuleFor(cmd => cmd.Item.Quantity).GreaterThan(0);
            RuleFor(cmd => cmd.Item.DiscountPercent).InclusiveBetween(0, 100);
        }
    }
}
