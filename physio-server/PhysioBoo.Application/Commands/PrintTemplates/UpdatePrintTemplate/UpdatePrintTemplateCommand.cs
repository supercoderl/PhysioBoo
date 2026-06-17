using MediatR;
using PhysioBoo.Application.ViewModels.PrintTemplates;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.PrintTemplates.UpdatePrintTemplate
{
    public sealed class UpdatePrintTemplateCommand : CommandBase, IRequest
    {
        private static readonly UpdatePrintTemplateCommandValidation s_validation = new();

        public Guid Id { get; }
        public UpdatePrintTemplateViewModel PrintTemplate { get; }

        public UpdatePrintTemplateCommand(
            Guid id,
            UpdatePrintTemplateViewModel printTemplate
        ) : base(Guid.NewGuid())
        {
            Id = id;
            PrintTemplate = printTemplate;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
