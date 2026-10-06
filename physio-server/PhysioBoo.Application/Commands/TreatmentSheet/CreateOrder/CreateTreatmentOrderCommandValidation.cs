using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.TreatmentSheet.CreateOrder
{
    public sealed class CreateTreatmentOrderCommandValidation : AbstractValidator<CreateTreatmentOrderCommand>
    {
        public CreateTreatmentOrderCommandValidation()
        {
            RuleFor(c => c.PatientId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Treatment.EmptyId).WithMessage("Patient may not be empty.");

            RuleFor(c => c.Input.OrderType)
                .Must(v => Enum.TryParse(v, true, out TreatmentOrderType t) && Enum.IsDefined(t))
                .WithErrorCode(DomainErrorCodes.Treatment.InvalidOrderType).WithMessage("Order type is not valid.");

            RuleFor(c => c.Input.OrderName)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Treatment.EmptyOrderName).WithMessage("Order name may not be empty.")
                .MaximumLength(255).WithErrorCode(DomainErrorCodes.Treatment.TextExceedsMaxLength).WithMessage("Order name may not exceed 255 characters.");

            RuleFor(c => c.Input.Priority)
                .Must(v => Enum.TryParse(v, true, out TreatmentOrderPriority p) && Enum.IsDefined(p))
                .WithErrorCode(DomainErrorCodes.Treatment.InvalidPriority).WithMessage("Priority must be Routine, Urgent or Stat.");

            RuleFor(c => c.Input.Frequency)
                .MaximumLength(64).WithErrorCode(DomainErrorCodes.Treatment.TextExceedsMaxLength).WithMessage("Frequency may not exceed 64 characters.")
                .When(c => c.Input.Frequency != null);

            RuleFor(c => c.Input.Status)
                .Must(v => Enum.TryParse(v, true, out TreatmentOrderStatus s) && Enum.IsDefined(s))
                .WithErrorCode(DomainErrorCodes.Treatment.InvalidStatus).WithMessage("Status is not valid.")
                .When(c => !string.IsNullOrWhiteSpace(c.Input.Status));

            RuleFor(c => c.Input)
                .Must(v => !v.EndTime.HasValue || v.EndTime >= v.StartTime)
                .WithErrorCode(DomainErrorCodes.Treatment.InvalidDateRange).WithMessage("End time may not be before start time.");
        }
    }
}
