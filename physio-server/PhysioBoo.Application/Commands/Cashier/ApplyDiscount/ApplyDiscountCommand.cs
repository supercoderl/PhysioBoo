
using PhysioBoo.Application.ViewModels.Cashier;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Cashier.ApplyDiscount
{
    public sealed class ApplyDiscountCommand : CommandBase, IRequest
    {
        private static readonly ApplyDiscountCommandValidation s_validation = new();

        public Guid InvoiceId { get; }
        public ApplyDiscountViewModel Discount { get; }

        public ApplyDiscountCommand(Guid invoiceId, ApplyDiscountViewModel discount) : base(Guid.NewGuid())
        {
            InvoiceId = invoiceId;
            Discount = discount;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
