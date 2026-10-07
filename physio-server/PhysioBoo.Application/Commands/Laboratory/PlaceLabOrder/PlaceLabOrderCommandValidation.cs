using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Laboratory.PlaceLabOrder
{
    public sealed class PlaceLabOrderCommandValidation : AbstractValidator<PlaceLabOrderCommand>
    {
        public PlaceLabOrderCommandValidation()
        {
            RuleFor(c => c.Order.PatientId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Validation.Required).WithMessage("Patient is required.");

            RuleFor(c => c.Order.TestIds)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Validation.Required).WithMessage("Choose at least one test.");

            RuleFor(c => c.Order.Priority)
                .Must(p => p == null || Enum.TryParse<Domain.Enums.LabPriority>(p, true, out _))
                .WithErrorCode(DomainErrorCodes.Validation.InvalidEnum).WithMessage("Priority must be Routine, Urgent or Stat.");

            RuleFor(c => c.Order.ClinicalNotes)
                .MaximumLength(2000).WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength).WithMessage("Clinical notes may not exceed 2000 characters.");
        }
    }
}
