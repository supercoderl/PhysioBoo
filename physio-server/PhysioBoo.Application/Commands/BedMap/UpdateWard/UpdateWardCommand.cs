using PhysioBoo.Application.ViewModels.BedMap;

namespace PhysioBoo.Application.Commands.BedMap.UpdateWard
{
    public sealed class UpdateWardCommand : CommandBase, IRequest
    {
        private static readonly UpdateWardCommandValidation s_validation = new();

        public Guid Id { get; }
        public UpdateWardViewModel Ward { get; }

        public UpdateWardCommand(Guid id, UpdateWardViewModel ward) : base(Guid.NewGuid())
        {
            Id = id;
            Ward = ward;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
