using MediatR;
using PhysioBoo.Application.ViewModels.PrintTemplates;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.PrintTemplates.CreatePrintTemplate
{
    public sealed class CreatePrintTemplateCommand : CommandBase, IRequest
    {
        private static readonly CreatePrintTemplateCommandValidation s_validation = new();

        public Guid NewId { get; }
        public CreatePrintTemplateViewModel NewPrintTemplate { get; }

        public CreatePrintTemplateCommand(
            Guid newId,
            CreatePrintTemplateViewModel newPrintTemplate
        ) : base(Guid.NewGuid())
        {
            NewId = newId;
            NewPrintTemplate = newPrintTemplate;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
