using PhysioBoo.Application.ViewModels.BedMap;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.BedMap.CreateBed
{
    public sealed class CreateBedCommandValidation : AbstractValidator<CreateBedCommand>
    {
        public CreateBedCommandValidation()
        {
            RuleFor(c => c.NewBed.WardId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Bed.EmptyWardId).WithMessage("Ward may not be empty.");

            RuleFor(c => c.NewBed.Number)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Bed.EmptyNumber).WithMessage("Bed number may not be empty.")
                .MaximumLength(32).WithErrorCode(DomainErrorCodes.Bed.NumberExceedsMaxLength).WithMessage("Bed number may not exceed 32 characters.");

            RuleFor(c => c.NewBed.RoomNumber)
                .MaximumLength(32).WithErrorCode(DomainErrorCodes.Bed.RoomNumberExceedsMaxLength).WithMessage("Room number may not exceed 32 characters.")
                .When(c => c.NewBed.RoomNumber != null);

            RuleFor(c => c.NewBed.Floor)
                .InclusiveBetween(-5, 200).WithErrorCode(DomainErrorCodes.Bed.InvalidFloor).WithMessage("Floor must be between -5 and 200.")
                .When(c => c.NewBed.Floor.HasValue);

            RuleFor(c => c.NewBed.BedType)
                .Must(v => BedTypeText.TryParse(v, out _))
                .WithErrorCode(DomainErrorCodes.Bed.InvalidType).WithMessage("Bed type is not valid.");

            RuleFor(c => c.NewBed.Notes)
                .MaximumLength(1000).WithErrorCode(DomainErrorCodes.Bed.NotesExceedsMaxLength).WithMessage("Notes may not exceed 1000 characters.")
                .When(c => c.NewBed.Notes != null);
        }
    }
}
