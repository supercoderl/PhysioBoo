

namespace PhysioBoo.Application.Commands.Cashier.VoidInvoice
{
    public sealed class VoidInvoiceCommandValidation : AbstractValidator<VoidInvoiceCommand>
    {
        public VoidInvoiceCommandValidation()
        {
            RuleFor(cmd => cmd.InvoiceId).NotEmpty();
            RuleFor(cmd => cmd.Void.Reason).NotEmpty();
        }
    }
}
