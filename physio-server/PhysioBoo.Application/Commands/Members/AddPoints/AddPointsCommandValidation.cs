using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Members.AddPoints
{
    public sealed class AddPointsCommandValidation : AbstractValidator<AddPointsCommand>
    {
        public AddPointsCommandValidation()
        {
            RuleFor(c => c.MemberId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Member.EmptyId).WithMessage("Member id may not be empty.");

            RuleFor(c => c.Input.Points)
                .InclusiveBetween(1, 1_000_000).WithErrorCode(DomainErrorCodes.PointTransaction.InvalidPoints).WithMessage("Points must be between 1 and 1,000,000.");

            RuleFor(c => c.Input.Description)
                .NotEmpty().WithErrorCode(DomainErrorCodes.PointTransaction.EmptyDescription).WithMessage("Description may not be empty.")
                .MaximumLength(255).WithErrorCode(DomainErrorCodes.PointTransaction.DescriptionExceedsMaxLength).WithMessage("Description may not exceed 255 characters.");
        }
    }
}
