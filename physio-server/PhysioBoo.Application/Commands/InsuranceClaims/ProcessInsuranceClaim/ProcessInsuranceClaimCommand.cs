namespace PhysioBoo.Application.Commands.InsuranceClaims.ProcessInsuranceClaim
{
    /// <summary>
    /// Moves a claim through its adjudication workflow (submit → approve/reject → appeal → settle).
    /// </summary>
    public sealed class ProcessInsuranceClaimCommand : CommandBase, IRequest
    {
        private static readonly ProcessInsuranceClaimCommandValidation s_validation = new();

        public Guid Id { get; }
        public InsuranceClaimAction Action { get; }
        public decimal? Amount { get; }
        public string? Text { get; }
        public DateTime? EffectiveDate { get; }
        public string? Method { get; }

        public ProcessInsuranceClaimCommand(
            Guid id,
            InsuranceClaimAction action,
            decimal? amount = null,
            string? text = null,
            DateTime? effectiveDate = null,
            string? method = null
        ) : base(id)
        {
            Id = id;
            Action = action;
            Amount = amount;
            Text = text;
            EffectiveDate = effectiveDate;
            Method = method;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
