using PhysioBoo.Application.Extensions.Validation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.PrintTemplates.SaveVersionPrintTemplate
{
    public sealed class SaveVersionPrintTemplateCommandValidation : AbstractValidator<SaveVersionPrintTemplateCommand>
    {
        public SaveVersionPrintTemplateCommandValidation()
        {
            RuleForId();
            RuleForVersion();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.PrintTemplate.EmptyId)
                .WithMessage("Id may not be empty.");
        }

        public void RuleForVersion()
        {
            RuleFor(cmd => cmd.PrintTemplateVersion.VersionNumber)
                .GreaterThan(0)
                .WithErrorCode(DomainErrorCodes.Validation.OutOfRange)
                .WithMessage("VersionNumber must be greater than 0.");

            RuleFor(cmd => cmd.PrintTemplateVersion.PaperSize)
                .IsInEnum()
                .WithErrorCode(DomainErrorCodes.Validation.InvalidEnum)
                .WithMessage("Paper size is invalid.");

            RuleFor(cmd => cmd.PrintTemplateVersion.Orientation)
                .IsInEnum()
                .WithErrorCode(DomainErrorCodes.Validation.InvalidEnum)
                .WithMessage("Orientation is invalid.");

            RuleFor(cmd => cmd.PrintTemplateVersion.BodyHtml)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Validation.Required)
                .WithMessage("BodyHtml may not be empty.");
        }
    }
}
