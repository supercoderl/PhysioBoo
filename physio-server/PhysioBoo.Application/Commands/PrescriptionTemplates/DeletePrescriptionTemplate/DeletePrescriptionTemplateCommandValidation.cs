using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.PrescriptionTemplates.DeletePrescriptionTemplate
{
    public sealed class DeletePrescriptionTemplateCommandValidation : AbstractValidator<DeletePrescriptionTemplateCommand>
    {
        public DeletePrescriptionTemplateCommandValidation()
        {
            RuleFor(c => c.Id).NotEmpty().WithErrorCode(DomainErrorCodes.PrescriptionTemplate.EmptyName).WithMessage("Template id is required.");
        }
    }
}
