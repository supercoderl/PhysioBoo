using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.HomeBanners.DeleteHomeBanner
{
    public sealed class DeleteHomeBannerCommandValidation : AbstractValidator<DeleteHomeBannerCommand>
    {
        public DeleteHomeBannerCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.HomeBanner.EmptyId).WithMessage("Id may not be empty.");
        }
    }
}
