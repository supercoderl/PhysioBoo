using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.PrintTemplates.UpdatePrintTemplate
{
    public sealed class UpdatePrintTemplateCommandValidation : AbstractValidator<UpdatePrintTemplateCommand>
    {
        public UpdatePrintTemplateCommandValidation()
        {
            RuleForId();
            RuleForName();
            RuleForCode();
            RuleForModule();
            RuleForDocumentType();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.PrintTemplate.EmptyId)
                .WithMessage("Id may not be empty.");
        }

        public void RuleForName()
        {
            RuleFor(cmd => cmd.PrintTemplate.Name)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.PrintTemplate.EmptyName)
                .WithMessage("Name may not be empty.")
                .MaximumLength(100)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("Name may not be longer than 100 characters.");
        }

        public void RuleForCode()
        {
            RuleFor(cmd => cmd.PrintTemplate.Code)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Validation.Required)
                .WithMessage("Code may not be empty.")
                .MaximumLength(100)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("Code may not be longer than 100 characters.");
        }

        public void RuleForModule()
        {
            RuleFor(cmd => cmd.PrintTemplate.Module)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Validation.Required)
                .WithMessage("Module may not be empty.")
                .MaximumLength(100)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("Module may not be longer than 100 characters.");
        }

        public void RuleForDocumentType()
        {
            RuleFor(cmd => cmd.PrintTemplate.DocumentType)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Validation.Required)
                .WithMessage("DocumentType may not be empty.");
        }
    }
}
