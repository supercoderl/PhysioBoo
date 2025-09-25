using FluentValidation;

namespace PhysioBoo.Application.Commands.Reviews
{
    public sealed class CreateReviewCommandValidation : AbstractValidator<CreateReviewCommand>
    {
        public CreateReviewCommandValidation()
        {

        }
    }
}
