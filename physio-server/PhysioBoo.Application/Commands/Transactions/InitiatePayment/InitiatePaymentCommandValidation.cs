
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Transactions.InitiatePayment
{
    public sealed class InitiatePaymentCommandValidation : AbstractValidator<InitiatePaymentCommand>
    {
        public InitiatePaymentCommandValidation()
        {
            RuleForGatewayProvider();
            RuleForInvoiceNo();
            RuleForAmount();
            RuleForGoodsName();
        }

        public void RuleForGatewayProvider()
        {
            RuleFor(cmd => cmd.NewPayment.GatewayProvider)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Transaction.EmptyGatewayProvider)
                .WithMessage("GatewayProvider may not be empty.");
        }

        public void RuleForInvoiceNo()
        {
            RuleFor(cmd => cmd.NewPayment.InvoiceNo)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Transaction.EmptyInvoiceNo)
                .WithMessage("InvoiceNo may not be empty.");
        }

        public void RuleForAmount()
        {
            RuleFor(cmd => cmd.NewPayment.Amount)
                .GreaterThan(0)
                .WithErrorCode(DomainErrorCodes.Transaction.InvalidAmount)
                .WithMessage("Amount must be greater than zero.");
        }

        public void RuleForGoodsName()
        {
            RuleFor(cmd => cmd.NewPayment.GoodsName)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Transaction.EmptyGoodsName)
                .WithMessage("GoodsName may not be empty.");
        }
    }
}
