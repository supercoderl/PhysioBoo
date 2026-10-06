using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Dispensing.UpdateDispenseItem
{
    public sealed class UpdateDispenseItemCommandValidation : AbstractValidator<UpdateDispenseItemCommand>
    {
        // Other statuses are reached through dedicated actions (scan, replace, reserve, complete).
        private static readonly DispenseItemStatus[] s_settable = { DispenseItemStatus.NotPicked, DispenseItemStatus.Picked, DispenseItemStatus.OnHold };

        public UpdateDispenseItemCommandValidation()
        {
            RuleFor(c => c.PrescriptionId).NotEmpty().WithErrorCode(DomainErrorCodes.Dispensing.EmptyId).WithMessage("Prescription id may not be empty.");
            RuleFor(c => c.ItemId).NotEmpty().WithErrorCode(DomainErrorCodes.Dispensing.EmptyId).WithMessage("Item id may not be empty.");

            RuleFor(c => c.QtyToDispense)
                .GreaterThanOrEqualTo(0).WithErrorCode(DomainErrorCodes.Dispensing.InvalidQuantity).WithMessage("Quantity may not be negative.")
                .When(c => c.QtyToDispense.HasValue);

            RuleFor(c => c.Status)
                .Must(v => Enum.TryParse(v, true, out DispenseItemStatus s) && s_settable.Contains(s))
                .WithErrorCode(DomainErrorCodes.Dispensing.InvalidStatus).WithMessage("Status must be NotPicked, Picked or OnHold.")
                .When(c => !string.IsNullOrWhiteSpace(c.Status));
        }
    }
}
