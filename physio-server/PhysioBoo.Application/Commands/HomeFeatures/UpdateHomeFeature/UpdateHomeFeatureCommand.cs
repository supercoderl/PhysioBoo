using PhysioBoo.Application.ViewModels.HomeContent;

namespace PhysioBoo.Application.Commands.HomeFeatures.UpdateHomeFeature
{
    public sealed class UpdateHomeFeatureCommand : CommandBase, IRequest
    {
        private static readonly UpdateHomeFeatureCommandValidation s_validation = new();

        public Guid Id { get; }
        public SaveHomeFeatureViewModel HomeFeature { get; }

        public UpdateHomeFeatureCommand(Guid id, SaveHomeFeatureViewModel homeFeature) : base(Guid.NewGuid())
        {
            Id = id;
            HomeFeature = homeFeature;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
