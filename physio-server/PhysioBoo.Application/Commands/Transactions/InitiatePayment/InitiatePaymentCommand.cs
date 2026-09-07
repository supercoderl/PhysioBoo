
using PhysioBoo.Application.ViewModels.Transactions;
using PhysioBoo.SharedKernel.Commands;
using System.Text.Json.Serialization;

namespace PhysioBoo.Application.Commands.Transactions.InitiatePayment
{
    public sealed class InitiatePaymentCommand : CommandBase, IRequest
    {
        private static readonly InitiatePaymentCommandValidation s_validation = new();

        public InitiatePaymentViewModel NewPayment { get; }

        [JsonIgnore]
        public TransactionViewModel? Result { get; set; }

        public InitiatePaymentCommand(InitiatePaymentViewModel newPayment) : base(Guid.NewGuid())
        {
            NewPayment = newPayment;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
