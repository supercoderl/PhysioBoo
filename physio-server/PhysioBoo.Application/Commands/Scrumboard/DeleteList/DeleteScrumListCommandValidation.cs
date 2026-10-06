using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Scrumboard.DeleteList
{
    public sealed class DeleteScrumListCommandValidation : AbstractValidator<DeleteScrumListCommand>
    {
        public DeleteScrumListCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Scrumboard.EmptyId).WithMessage("Id may not be empty.");
        }
    }
}
