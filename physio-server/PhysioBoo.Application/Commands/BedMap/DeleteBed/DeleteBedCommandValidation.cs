using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.BedMap.DeleteBed
{
    public sealed class DeleteBedCommandValidation : AbstractValidator<DeleteBedCommand>
    {
        public DeleteBedCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Bed.EmptyId).WithMessage("Id may not be empty.");
        }
    }
}
