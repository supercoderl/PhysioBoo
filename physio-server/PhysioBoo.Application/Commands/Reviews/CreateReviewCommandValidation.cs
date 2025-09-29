using FluentValidation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Reviews
{
    public sealed class CreateReviewCommandValidation : AbstractValidator<CreateReviewCommand>
    {
        public CreateReviewCommandValidation()
        {
            RuleForEntityId();
        }

        public void RuleForEntityId()
        {
            RuleFor(cmd => cmd.NewReview.EntityId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Review.EmptyEntityId)
                .WithMessage("EntityId may not be empty.");
        }
    }
}
