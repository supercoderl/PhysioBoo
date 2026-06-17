using FluentValidation;

namespace PhysioBoo.Application.Commands.PrintTemplates.CreatePrintTemplate
{
    public sealed class CreatePrintTemplateCommandValidation : AbstractValidator<CreatePrintTemplateCommand>
    {
        public CreatePrintTemplateCommandValidation()
        {
            // TODO: Add your validation rules here
            // Example:
            // RuleFor(x => x.NewUser.Name)
            //     .NotEmpty()
            //     .WithMessage("Name is required");
        }
    }
}