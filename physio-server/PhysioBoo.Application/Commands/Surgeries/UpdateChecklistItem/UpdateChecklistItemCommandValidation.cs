using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Surgeries.UpdateChecklistItem
{
    public sealed class UpdateChecklistItemCommandValidation : AbstractValidator<UpdateChecklistItemCommand>
    {
        public UpdateChecklistItemCommandValidation()
        {
            RuleFor(c => c.SurgeryId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Surgery.EmptyId).WithMessage("Surgery id may not be empty.");

            RuleFor(c => c.ItemId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Surgery.EmptyId).WithMessage("Checklist item id may not be empty.");

            RuleFor(c => c.Input.Status)
                .Must(v => Enum.TryParse(v, true, out ChecklistItemStatus _))
                .WithErrorCode(DomainErrorCodes.Surgery.InvalidStatus).WithMessage("Status is not a valid checklist status.");
        }
    }
}
