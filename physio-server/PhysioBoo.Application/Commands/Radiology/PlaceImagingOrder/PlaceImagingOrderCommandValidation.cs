using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Radiology.PlaceImagingOrder
{
    public sealed class PlaceImagingOrderCommandValidation : AbstractValidator<PlaceImagingOrderCommand>
    {
        public PlaceImagingOrderCommandValidation()
        {
            RuleFor(c => c.Order.PatientId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Validation.Required).WithMessage("Patient is required.");

            RuleFor(c => c.Order.ModalityId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Validation.Required).WithMessage("Modality is required.");

            RuleFor(c => c.Order.BodyPart)
                .MaximumLength(100).WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength).WithMessage("Body part may not exceed 100 characters.");

            RuleFor(c => c.Order.ClinicalIndication)
                .MaximumLength(2000).WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength).WithMessage("Clinical indication may not exceed 2000 characters.");

            RuleFor(c => c.Order.Priority)
                .Must(p => p == null || Enum.TryParse<Domain.Enums.LabPriority>(p, true, out _))
                .WithErrorCode(DomainErrorCodes.Validation.InvalidEnum).WithMessage("Priority must be Routine, Urgent or Stat.");
        }
    }
}
