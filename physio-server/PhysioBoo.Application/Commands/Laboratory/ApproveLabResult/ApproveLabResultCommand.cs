namespace PhysioBoo.Application.Commands.Laboratory.ApproveLabResult
{
    public sealed class ApproveLabResultCommand : CommandBase, IRequest
    {
        private static readonly ApproveLabResultCommandValidation s_validation = new();

        public Guid Id { get; }

        public ApproveLabResultCommand(Guid id) : base(Guid.NewGuid())
        {
            Id = id;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
