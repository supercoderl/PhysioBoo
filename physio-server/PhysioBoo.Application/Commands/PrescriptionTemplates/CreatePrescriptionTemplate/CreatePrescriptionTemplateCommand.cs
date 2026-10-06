using PhysioBoo.Application.ViewModels.PrescriptionTemplates;

namespace PhysioBoo.Application.Commands.PrescriptionTemplates.CreatePrescriptionTemplate
{
    public sealed class CreatePrescriptionTemplateCommand : CommandBase, IRequest
    {
        private static readonly CreatePrescriptionTemplateCommandValidation s_validation = new();

        public Guid NewId { get; }
        public CreatePrescriptionTemplateViewModel Template { get; }

        public CreatePrescriptionTemplateCommand(Guid newId, CreatePrescriptionTemplateViewModel template) : base(newId)
        {
            NewId = newId;
            Template = template;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
