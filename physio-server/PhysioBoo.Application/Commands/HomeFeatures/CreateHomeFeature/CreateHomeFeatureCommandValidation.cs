using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.HomeFeatures.CreateHomeFeature
{
    public sealed class CreateHomeFeatureCommandValidation : AbstractValidator<CreateHomeFeatureCommand>
    {
        public CreateHomeFeatureCommandValidation()
        {
            RuleFor(c => c.HomeFeature.Icon)
                .MaximumLength(60).WithErrorCode(DomainErrorCodes.HomeFeature.IconExceedsMaxLength).WithMessage("Icon may not exceed 60 characters.");

            RuleFor(c => c.HomeFeature.Title)
                .NotEmpty().WithErrorCode(DomainErrorCodes.HomeFeature.EmptyTitle).WithMessage("Title may not be empty.")
                .MaximumLength(100).WithErrorCode(DomainErrorCodes.HomeFeature.TitleExceedsMaxLength).WithMessage("Title may not exceed 100 characters.");

            RuleFor(c => c.HomeFeature.Description)
                .MaximumLength(500).WithErrorCode(DomainErrorCodes.HomeFeature.DescriptionExceedsMaxLength).WithMessage("Description may not exceed 500 characters.");

            RuleFor(c => c.HomeFeature.Order)
                .NotNull().WithErrorCode(DomainErrorCodes.HomeFeature.InvalidOrder).WithMessage("Order is required.")
                .GreaterThanOrEqualTo(1).WithErrorCode(DomainErrorCodes.HomeFeature.InvalidOrder).WithMessage("Order must be at least 1.");
        }
    }
}
