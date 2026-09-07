

namespace PhysioBoo.Application.Commands.Cashier.ApplyDiscount
{
    public sealed class ApplyDiscountCommandValidation : AbstractValidator<ApplyDiscountCommand>
    {
        public ApplyDiscountCommandValidation()
        {
            RuleFor(cmd => cmd.InvoiceId).NotEmpty();
            RuleFor(cmd => cmd.Discount.DiscountPercent).InclusiveBetween(0, 100);
        }
    }
}
