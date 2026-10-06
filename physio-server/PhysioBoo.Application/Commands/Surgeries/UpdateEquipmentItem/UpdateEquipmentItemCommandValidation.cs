using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Surgeries.UpdateEquipmentItem
{
    public sealed class UpdateEquipmentItemCommandValidation : AbstractValidator<UpdateEquipmentItemCommand>
    {
        public UpdateEquipmentItemCommandValidation()
        {
            RuleFor(c => c.SurgeryId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Surgery.EmptyId).WithMessage("Surgery id may not be empty.");

            RuleFor(c => c.ItemId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Surgery.EmptyId).WithMessage("Equipment item id may not be empty.");

            RuleFor(c => c.Input.Status)
                .Must(v => Enum.TryParse(v, true, out EquipmentStatus _))
                .WithErrorCode(DomainErrorCodes.Surgery.InvalidStatus).WithMessage("Status is not a valid equipment status.");

            RuleFor(c => c.Input.Quantity!.Value)
                .InclusiveBetween(1, 1000).WithErrorCode(DomainErrorCodes.Surgery.InvalidQuantity).WithMessage("Quantity must be between 1 and 1000.")
                .When(c => c.Input.Quantity.HasValue);
        }
    }
}
