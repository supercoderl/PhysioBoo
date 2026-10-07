using PhysioBoo.Application.ViewModels.HomeContent;

namespace PhysioBoo.Application.Commands.HomeBanners.CreateHomeBanner
{
    public sealed class CreateHomeBannerCommand : CommandBase, IRequest
    {
        private static readonly CreateHomeBannerCommandValidation s_validation = new();

        public Guid NewId { get; }
        public SaveHomeBannerViewModel HomeBanner { get; }

        public CreateHomeBannerCommand(Guid newId, SaveHomeBannerViewModel homeBanner) : base(Guid.NewGuid())
        {
            NewId = newId;
            HomeBanner = homeBanner;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
