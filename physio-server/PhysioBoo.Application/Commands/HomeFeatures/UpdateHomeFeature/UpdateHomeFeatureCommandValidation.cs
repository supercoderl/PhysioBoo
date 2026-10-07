using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.HomeFeatures.UpdateHomeFeature
{
    public sealed class UpdateHomeFeatureCommandValidation : AbstractValidator<UpdateHomeFeatureCommand>
    {
        public UpdateHomeFeatureCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.HomeFeature.EmptyId).WithMessage("Id may not be empty.");

            RuleFor(c => c.HomeFeature.Icon)
                .MaximumLength(60).WithErrorCode(DomainErrorCodes.HomeFeature.IconExceedsMaxLength).WithMessage("Icon may not exceed 60 characters.");

            RuleFor(c => c.HomeFeature.Title)
                .NotEmpty().WithErrorCode(DomainErrorCodes.HomeFeature.EmptyTitle).WithMessage("Title may not be empty.")
                .When(c => c.HomeFeature.Title != null);

            RuleFor(c => c.HomeFeature.Title)
                .MaximumLength(100).WithErrorCode(DomainErrorCodes.HomeFeature.TitleExceedsMaxLength).WithMessage("Title may not exceed 100 characters.");

            RuleFor(c => c.HomeFeature.Description)
                .MaximumLength(500).WithErrorCode(DomainErrorCodes.HomeFeature.DescriptionExceedsMaxLength).WithMessage("Description may not exceed 500 characters.");

            RuleFor(c => c.HomeFeature.Order)
                .GreaterThanOrEqualTo(1).WithErrorCode(DomainErrorCodes.HomeFeature.InvalidOrder).WithMessage("Order must be at least 1.")
                .When(c => c.HomeFeature.Order != null);
        }
    }
}
