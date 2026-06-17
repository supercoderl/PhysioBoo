using FluentValidation;

namespace PhysioBoo.Application.Commands.PrintTemplates.SaveVersionPrintTemplate
{
    public sealed class SaveVersionPrintTemplateCommandValidation : AbstractValidator<SaveVersionPrintTemplateCommand>
    {
        public SaveVersionPrintTemplateCommandValidation()
        {
            // TODO: Add your validation rules here
            // Example:
            // RuleFor(x => x.NewUser.Name)
            //     .NotEmpty()
            //     .WithMessage("Name is required");
        }
    }
}