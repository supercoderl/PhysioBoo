
using PhysioBoo.Application.ViewModels.Cashier;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Cashier.VoidInvoice
{
    public sealed class VoidInvoiceCommand : CommandBase, IRequest
    {
        private static readonly VoidInvoiceCommandValidation s_validation = new();

        public Guid InvoiceId { get; }
        public VoidInvoiceViewModel Void { get; }

        public VoidInvoiceCommand(Guid invoiceId, VoidInvoiceViewModel @void) : base(Guid.NewGuid())
        {
            InvoiceId = invoiceId;
            Void = @void;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
