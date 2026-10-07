using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.HomeBanners.CreateHomeBanner
{
    public sealed class CreateHomeBannerCommandValidation : AbstractValidator<CreateHomeBannerCommand>
    {
        public CreateHomeBannerCommandValidation()
        {
            RuleFor(c => c.HomeBanner.Title)
                .NotEmpty().WithErrorCode(DomainErrorCodes.HomeBanner.EmptyTitle).WithMessage("Title may not be empty.")
                .MaximumLength(150).WithErrorCode(DomainErrorCodes.HomeBanner.TitleExceedsMaxLength).WithMessage("Title may not exceed 150 characters.");

            RuleFor(c => c.HomeBanner.Subtitle)
                .MaximumLength(300).WithErrorCode(DomainErrorCodes.HomeBanner.SubtitleExceedsMaxLength).WithMessage("Subtitle may not exceed 300 characters.");

            RuleFor(c => c.HomeBanner.ImageUrl)
                .MaximumLength(1000).WithErrorCode(DomainErrorCodes.HomeBanner.ImageUrlExceedsMaxLength).WithMessage("ImageUrl may not exceed 1000 characters.");

            RuleFor(c => c.HomeBanner.ButtonText)
                .MaximumLength(60).WithErrorCode(DomainErrorCodes.HomeBanner.ButtonTextExceedsMaxLength).WithMessage("ButtonText may not exceed 60 characters.");

            RuleFor(c => c.HomeBanner.ButtonLink)
                .MaximumLength(1000).WithErrorCode(DomainErrorCodes.HomeBanner.ButtonLinkExceedsMaxLength).WithMessage("ButtonLink may not exceed 1000 characters.");

            RuleFor(c => c.HomeBanner.Order)
                .NotNull().WithErrorCode(DomainErrorCodes.HomeBanner.InvalidOrder).WithMessage("Order is required.")
                .GreaterThanOrEqualTo(1).WithErrorCode(DomainErrorCodes.HomeBanner.InvalidOrder).WithMessage("Order must be at least 1.");
        }
    }
}
