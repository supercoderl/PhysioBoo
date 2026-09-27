using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.PrintTemplates.DeletePrintTemplate
{
    public sealed class DeletePrintTemplateCommandValidation : AbstractValidator<DeletePrintTemplateCommand>
    {
        public DeletePrintTemplateCommandValidation()
        {
            RuleForId();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.PrintTemplate.EmptyId)
                .WithMessage("Id may not be empty.");
        }
    }
}
