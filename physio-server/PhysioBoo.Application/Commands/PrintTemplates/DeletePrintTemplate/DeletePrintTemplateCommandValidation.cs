using FluentValidation;

namespace PhysioBoo.Application.Commands.PrintTemplates.DeletePrintTemplate
{
    public sealed class DeletePrintTemplateCommandValidation : AbstractValidator<DeletePrintTemplateCommand>
    {
        public DeletePrintTemplateCommandValidation()
        {
            // TODO: Add your validation rules here
            // Example:
            // RuleFor(x => x.NewUser.Name)
            //     .NotEmpty()
            //     .WithMessage("Name is required");
        }
    }
}