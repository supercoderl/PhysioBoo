using PhysioBoo.Application.ViewModels.Leads;

namespace PhysioBoo.Application.Commands.Leads.CreateLead
{
    public sealed class CreateLeadCommand : CommandBase, IRequest
    {
        private static readonly CreateLeadCommandValidation s_validation = new();

        public Guid NewId { get; }
        public CreateLeadViewModel NewLead { get; }

        public CreateLeadCommand(Guid newId, CreateLeadViewModel newLead) : base(Guid.NewGuid())
        {
            NewId = newId;
            NewLead = newLead;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
