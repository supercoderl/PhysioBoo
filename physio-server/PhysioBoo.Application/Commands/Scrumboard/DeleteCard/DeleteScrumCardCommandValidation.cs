using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Scrumboard.DeleteCard
{
    public sealed class DeleteScrumCardCommandValidation : AbstractValidator<DeleteScrumCardCommand>
    {
        public DeleteScrumCardCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Scrumboard.EmptyId).WithMessage("Id may not be empty.");
        }
    }
}
