using PhysioBoo.Application.ViewModels.HomeContent;

namespace PhysioBoo.Application.Commands.HomeFeatures.CreateHomeFeature
{
    public sealed class CreateHomeFeatureCommand : CommandBase, IRequest
    {
        private static readonly CreateHomeFeatureCommandValidation s_validation = new();

        public Guid NewId { get; }
        public SaveHomeFeatureViewModel HomeFeature { get; }

        public CreateHomeFeatureCommand(Guid newId, SaveHomeFeatureViewModel homeFeature) : base(Guid.NewGuid())
        {
            NewId = newId;
            HomeFeature = homeFeature;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
