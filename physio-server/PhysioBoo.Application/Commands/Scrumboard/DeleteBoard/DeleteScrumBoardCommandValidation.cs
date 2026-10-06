using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Scrumboard.DeleteBoard
{
    public sealed class DeleteScrumBoardCommandValidation : AbstractValidator<DeleteScrumBoardCommand>
    {
        public DeleteScrumBoardCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Scrumboard.EmptyId).WithMessage("Id may not be empty.");
        }
    }
}
