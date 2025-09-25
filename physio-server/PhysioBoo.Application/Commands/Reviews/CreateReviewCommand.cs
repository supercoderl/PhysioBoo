using MediatR;
using PhysioBoo.Application.ViewModels.Reviews;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Reviews
{
    public sealed class CreateReviewCommand : CommandBase, IRequest
    {
        private static readonly CreateReviewCommandValidation s_validation = new();

        public CreateReviewViewModel NewReview { get; }
        public Guid UserId { get; }

        public CreateReviewCommand(CreateReviewViewModel newReview, Guid userId) : base(Guid.NewGuid())
        {
            NewReview = newReview;
            UserId = userId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
