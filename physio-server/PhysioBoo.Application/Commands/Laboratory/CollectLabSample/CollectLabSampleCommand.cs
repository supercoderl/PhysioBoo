using PhysioBoo.Application.ViewModels.Laboratory;

namespace PhysioBoo.Application.Commands.Laboratory.CollectLabSample
{
    public sealed class CollectLabSampleCommand : CommandBase, IRequest
    {
        private static readonly CollectLabSampleCommandValidation s_validation = new();

        public Guid Id { get; }
        public CollectLabSampleViewModel Body { get; }

        public CollectLabSampleCommand(Guid id, CollectLabSampleViewModel body) : base(Guid.NewGuid())
        {
            Id = id;
            Body = body;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
