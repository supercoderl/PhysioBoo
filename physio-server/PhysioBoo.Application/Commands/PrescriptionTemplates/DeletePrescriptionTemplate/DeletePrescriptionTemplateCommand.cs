namespace PhysioBoo.Application.Commands.PrescriptionTemplates.DeletePrescriptionTemplate
{
    public sealed class DeletePrescriptionTemplateCommand : CommandBase, IRequest
    {
        private static readonly DeletePrescriptionTemplateCommandValidation s_validation = new();

        public Guid Id { get; }

        public DeletePrescriptionTemplateCommand(Guid id) : base(id)
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
