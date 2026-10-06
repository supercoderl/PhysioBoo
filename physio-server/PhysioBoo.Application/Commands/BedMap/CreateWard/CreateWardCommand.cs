using PhysioBoo.Application.ViewModels.BedMap;

namespace PhysioBoo.Application.Commands.BedMap.CreateWard
{
    public sealed class CreateWardCommand : CommandBase, IRequest
    {
        private static readonly CreateWardCommandValidation s_validation = new();

        public Guid NewId { get; }
        public CreateWardViewModel NewWard { get; }

        public CreateWardCommand(Guid newId, CreateWardViewModel newWard) : base(Guid.NewGuid())
        {
            NewId = newId;
            NewWard = newWard;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
