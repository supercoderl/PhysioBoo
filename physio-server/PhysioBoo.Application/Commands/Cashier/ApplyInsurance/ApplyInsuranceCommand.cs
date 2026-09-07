
using PhysioBoo.Application.ViewModels.Cashier;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Cashier.ApplyInsurance
{
    public sealed class ApplyInsuranceCommand : CommandBase, IRequest
    {
        private static readonly ApplyInsuranceCommandValidation s_validation = new();

        public Guid InvoiceId { get; }
        public ApplyInsuranceViewModel Insurance { get; }

        public ApplyInsuranceCommand(Guid invoiceId, ApplyInsuranceViewModel insurance) : base(Guid.NewGuid())
        {
            InvoiceId = invoiceId;
            Insurance = insurance;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
