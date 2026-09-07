

namespace PhysioBoo.Application.Commands.Cashier.ApplyInsurance
{
    public sealed class ApplyInsuranceCommandValidation : AbstractValidator<ApplyInsuranceCommand>
    {
        public ApplyInsuranceCommandValidation()
        {
            RuleFor(cmd => cmd.InvoiceId).NotEmpty();
            RuleFor(cmd => cmd.Insurance.InsuranceCompanyId).NotEmpty();
            RuleFor(cmd => cmd.Insurance.CoverageAmount).GreaterThanOrEqualTo(0);
        }
    }
}
