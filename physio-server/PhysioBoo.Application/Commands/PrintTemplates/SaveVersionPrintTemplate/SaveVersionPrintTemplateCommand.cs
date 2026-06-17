using MediatR;
using PhysioBoo.Application.ViewModels.PrintTemplateVersions;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.PrintTemplates.SaveVersionPrintTemplate
{
    public sealed class SaveVersionPrintTemplateCommand : CommandBase, IRequest
    {
        private static readonly SaveVersionPrintTemplateCommandValidation s_validation = new();

        public Guid Id { get; }
        public UpdatePrintTemplateVersionViewModel PrintTemplateVersion { get; }

        public SaveVersionPrintTemplateCommand(
            Guid id,
            UpdatePrintTemplateVersionViewModel printTemplateVersion
        ) : base(Guid.NewGuid())
        {
            Id = id;
            PrintTemplateVersion = printTemplateVersion;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
