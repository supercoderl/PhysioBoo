using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.WarehouseZones.DeleteWarehouseZone
{
    public sealed class DeleteWarehouseZoneCommand : CommandBase
    {
        private static readonly DeleteWarehouseZoneCommandValidation s_validation = new();

        public Guid Id { get; }
        public bool IsHard { get; }

        public DeleteWarehouseZoneCommand(
            Guid id,
            bool isHard = false
        ) : base(Guid.NewGuid())
        {
            Id = id;
            IsHard = isHard;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
