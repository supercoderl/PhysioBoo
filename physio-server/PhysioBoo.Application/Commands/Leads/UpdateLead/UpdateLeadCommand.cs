using PhysioBoo.Application.ViewModels.Leads;

namespace PhysioBoo.Application.Commands.Leads.UpdateLead
{
    public sealed class UpdateLeadCommand : CommandBase, IRequest
    {
        private static readonly UpdateLeadCommandValidation s_validation = new();

        public Guid Id { get; }
        public UpdateLeadViewModel Lead { get; }

        public UpdateLeadCommand(Guid id, UpdateLeadViewModel lead) : base(Guid.NewGuid())
        {
            Id = id;
            Lead = lead;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
