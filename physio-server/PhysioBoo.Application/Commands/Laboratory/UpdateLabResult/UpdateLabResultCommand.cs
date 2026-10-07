using PhysioBoo.Application.ViewModels.Laboratory;

namespace PhysioBoo.Application.Commands.Laboratory.UpdateLabResult
{
    public sealed class UpdateLabResultCommand : CommandBase, IRequest
    {
        private static readonly UpdateLabResultCommandValidation s_validation = new();

        public Guid Id { get; }
        public UpdateLabResultViewModel Body { get; }

        public UpdateLabResultCommand(Guid id, UpdateLabResultViewModel body) : base(Guid.NewGuid())
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
