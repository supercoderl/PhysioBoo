using PhysioBoo.Application.ViewModels.BedMap;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.BedMap.UpdateBed
{
    public sealed class UpdateBedCommandValidation : AbstractValidator<UpdateBedCommand>
    {
        public UpdateBedCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Bed.EmptyId).WithMessage("Id may not be empty.");

            RuleFor(c => c.Bed.WardId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Bed.EmptyWardId).WithMessage("Ward may not be empty.");

            RuleFor(c => c.Bed.Number)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Bed.EmptyNumber).WithMessage("Bed number may not be empty.")
                .MaximumLength(32).WithErrorCode(DomainErrorCodes.Bed.NumberExceedsMaxLength).WithMessage("Bed number may not exceed 32 characters.");

            RuleFor(c => c.Bed.RoomNumber)
                .MaximumLength(32).WithErrorCode(DomainErrorCodes.Bed.RoomNumberExceedsMaxLength).WithMessage("Room number may not exceed 32 characters.")
                .When(c => c.Bed.RoomNumber != null);

            RuleFor(c => c.Bed.Floor)
                .InclusiveBetween(-5, 200).WithErrorCode(DomainErrorCodes.Bed.InvalidFloor).WithMessage("Floor must be between -5 and 200.");

            RuleFor(c => c.Bed.BedType)
                .Must(v => BedTypeText.TryParse(v, out _))
                .WithErrorCode(DomainErrorCodes.Bed.InvalidType).WithMessage("Bed type is not valid.");

            // Occupied is only ever set by assigning a patient.
            RuleFor(c => c.Bed.Status)
                .Must(v => Enum.TryParse(v, true, out BedStatus s) && Enum.IsDefined(s) && s != BedStatus.Occupied)
                .WithErrorCode(DomainErrorCodes.Bed.InvalidStatus).WithMessage("Status must be Available, Maintenance or Reserved.");

            RuleFor(c => c.Bed.Notes)
                .MaximumLength(1000).WithErrorCode(DomainErrorCodes.Bed.NotesExceedsMaxLength).WithMessage("Notes may not exceed 1000 characters.")
                .When(c => c.Bed.Notes != null);
        }
    }
}
