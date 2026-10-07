using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Scrumboard.MoveList
{
    public sealed class MoveScrumListCommandValidation : AbstractValidator<MoveScrumListCommand>
    {
        public MoveScrumListCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Scrumboard.EmptyId).WithMessage("Id may not be empty.");

            RuleFor(c => c.Input.TargetIndex)
                .GreaterThanOrEqualTo(0).WithErrorCode(DomainErrorCodes.Scrumboard.InvalidPosition).WithMessage("Target position may not be negative.");
        }
    }
}
