namespace PhysioBoo.Application.Commands.Leads.DeleteLead
{
    public sealed class DeleteLeadCommand : CommandBase, IRequest
    {
        private static readonly DeleteLeadCommandValidation s_validation = new();

        public Guid Id { get; }
        public bool IsHard { get; }

        public DeleteLeadCommand(Guid id, bool isHard) : base(Guid.NewGuid())
        {
            Id = id;
            IsHard = isHard;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
