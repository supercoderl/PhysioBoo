using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Scrumboard.MoveCard
{
    public sealed class MoveScrumCardCommandValidation : AbstractValidator<MoveScrumCardCommand>
    {
        public MoveScrumCardCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Scrumboard.EmptyId).WithMessage("Id may not be empty.");

            RuleFor(c => c.Input.TargetListId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Scrumboard.EmptyId).WithMessage("Target list id may not be empty.");

            RuleFor(c => c.Input.TargetIndex)
                .GreaterThanOrEqualTo(0).WithErrorCode(DomainErrorCodes.Scrumboard.InvalidPosition).WithMessage("Target position may not be negative.");
        }
    }
}
