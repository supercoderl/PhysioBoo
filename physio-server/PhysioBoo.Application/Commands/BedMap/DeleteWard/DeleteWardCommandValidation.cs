using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.BedMap.DeleteWard
{
    public sealed class DeleteWardCommandValidation : AbstractValidator<DeleteWardCommand>
    {
        public DeleteWardCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Ward.EmptyId).WithMessage("Id may not be empty.");
        }
    }
}
