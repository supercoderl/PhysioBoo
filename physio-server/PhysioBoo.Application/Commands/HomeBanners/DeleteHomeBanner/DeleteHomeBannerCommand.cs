namespace PhysioBoo.Application.Commands.HomeBanners.DeleteHomeBanner
{
    public sealed class DeleteHomeBannerCommand : CommandBase, IRequest
    {
        private static readonly DeleteHomeBannerCommandValidation s_validation = new();

        public Guid Id { get; }

        public DeleteHomeBannerCommand(Guid id) : base(Guid.NewGuid())
        {
            Id = id;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
