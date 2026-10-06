using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.PrescriptionTemplates.CreatePrescriptionTemplate
{
    public sealed class CreatePrescriptionTemplateCommandValidation : AbstractValidator<CreatePrescriptionTemplateCommand>
    {
        public CreatePrescriptionTemplateCommandValidation()
        {
            RuleFor(c => c.Template.DoctorId).NotEmpty().WithErrorCode(DomainErrorCodes.PrescriptionTemplate.EmptyDoctor).WithMessage("Doctor is required.");

            RuleFor(c => c.Template.Name)
                .NotEmpty().WithErrorCode(DomainErrorCodes.PrescriptionTemplate.EmptyName).WithMessage("Template name may not be empty.")
                .MaximumLength(120).WithErrorCode(DomainErrorCodes.PrescriptionTemplate.NameExceedsMaxLength).WithMessage("Template name may not exceed 120 characters.");

            RuleFor(c => c.Template.Items)
                .NotEmpty().WithErrorCode(DomainErrorCodes.PrescriptionTemplate.EmptyItems).WithMessage("A template needs at least one medication.");

            RuleForEach(c => c.Template.Items).ChildRules(item =>
            {
                item.RuleFor(i => i.MedicineId).NotEmpty().WithErrorCode(DomainErrorCodes.PrescriptionTemplate.EmptyMedicine).WithMessage("Each line needs a catalog medicine.");
                item.RuleFor(i => i.Dose).NotEmpty().WithErrorCode(DomainErrorCodes.PrescriptionTemplate.EmptyDose).WithMessage("Each line needs a dose.");
                item.RuleFor(i => i.Frequency).NotEmpty().WithErrorCode(DomainErrorCodes.PrescriptionTemplate.EmptyFrequency).WithMessage("Each line needs a frequency.");
                item.RuleFor(i => i.DurationDays).InclusiveBetween(1, 365).WithErrorCode(DomainErrorCodes.PrescriptionTemplate.InvalidDuration).WithMessage("Duration must be between 1 and 365 days.");
                item.RuleFor(i => i.Quantity).GreaterThan(0).WithErrorCode(DomainErrorCodes.PrescriptionTemplate.InvalidQuantity).WithMessage("Quantity must be greater than 0.");
            }).When(c => c.Template.Items != null);
        }
    }
}
