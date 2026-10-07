using PhysioBoo.Application.ViewModels.HomeContent;

namespace PhysioBoo.Application.Commands.HomeBanners.UpdateHomeBanner
{
    public sealed class UpdateHomeBannerCommand : CommandBase, IRequest
    {
        private static readonly UpdateHomeBannerCommandValidation s_validation = new();

        public Guid Id { get; }
        public SaveHomeBannerViewModel HomeBanner { get; }

        public UpdateHomeBannerCommand(Guid id, SaveHomeBannerViewModel homeBanner) : base(Guid.NewGuid())
        {
            Id = id;
            HomeBanner = homeBanner;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
