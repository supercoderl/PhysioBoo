using PhysioBoo.Application.Extensions.Validation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.PrintTemplates.CreatePrintTemplate
{
    public sealed class CreatePrintTemplateCommandValidation : AbstractValidator<CreatePrintTemplateCommand>
    {
        public CreatePrintTemplateCommandValidation()
        {
            RuleForNewId();
            RuleForName();
            RuleForCode();
            RuleForModule();
            RuleForDocumentType();
            RuleForVersion();
        }

        public void RuleForNewId()
        {
            RuleFor(cmd => cmd.NewId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.PrintTemplate.EmptyId)
                .WithMessage("Id may not be empty.");
        }

        public void RuleForName()
        {
            RuleFor(cmd => cmd.NewPrintTemplate.Name)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.PrintTemplate.EmptyName)
                .WithMessage("Name may not be empty.")
                .MaximumLength(100)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("Name may not be longer than 100 characters.");
        }

        public void RuleForCode()
        {
            RuleFor(cmd => cmd.NewPrintTemplate.Code)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Validation.Required)
                .WithMessage("Code may not be empty.")
                .MaximumLength(100)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("Code may not be longer than 100 characters.");
        }

        public void RuleForModule()
        {
            RuleFor(cmd => cmd.NewPrintTemplate.Module)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Validation.Required)
                .WithMessage("Module may not be empty.")
                .MaximumLength(100)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("Module may not be longer than 100 characters.");
        }

        public void RuleForDocumentType()
        {
            RuleFor(cmd => cmd.NewPrintTemplate.DocumentType)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Validation.Required)
                .WithMessage("DocumentType may not be empty.");
        }

        public void RuleForVersion()
        {
            RuleFor(cmd => cmd.NewPrintTemplate.Version.PaperSize)
                .IsInEnum()
                .WithErrorCode(DomainErrorCodes.Validation.InvalidEnum)
                .WithMessage("Paper size is invalid.");

            RuleFor(cmd => cmd.NewPrintTemplate.Version.Orientation)
                .IsInEnum()
                .WithErrorCode(DomainErrorCodes.Validation.InvalidEnum)
                .WithMessage("Orientation is invalid.");

            RuleFor(cmd => cmd.NewPrintTemplate.Version.BodyHtml)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Validation.Required)
                .WithMessage("BodyHtml may not be empty.");
        }
    }
}
