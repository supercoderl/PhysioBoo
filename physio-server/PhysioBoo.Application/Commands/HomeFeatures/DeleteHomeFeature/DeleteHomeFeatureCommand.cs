namespace PhysioBoo.Application.Commands.HomeFeatures.DeleteHomeFeature
{
    public sealed class DeleteHomeFeatureCommand : CommandBase, IRequest
    {
        private static readonly DeleteHomeFeatureCommandValidation s_validation = new();

        public Guid Id { get; }

        public DeleteHomeFeatureCommand(Guid id) : base(Guid.NewGuid())
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
