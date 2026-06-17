using FluentValidation;

namespace PhysioBoo.Application.Commands.PrintTemplates.UpdatePrintTemplate
{
    public sealed class UpdatePrintTemplateCommandValidation : AbstractValidator<UpdatePrintTemplateCommand>
    {
        public UpdatePrintTemplateCommandValidation()
        {
            // TODO: Add your validation rules here
            // Example:
            // RuleFor(x => x.NewUser.Name)
            //     .NotEmpty()
            //     .WithMessage("Name is required");
        }
    }
}