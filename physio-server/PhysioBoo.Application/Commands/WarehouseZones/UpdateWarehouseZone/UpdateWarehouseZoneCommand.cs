
using PhysioBoo.Application.ViewModels.WarehouseZones;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.WarehouseZones.UpdateWarehouseZone
{
    public sealed class UpdateWarehouseZoneCommand : CommandBase, IRequest
    {
        private static readonly UpdateWarehouseZoneCommandValidation s_validation = new();

        public UpdateWarehouseZoneViewModel WarehouseZone { get; }
        public Guid Id { get; }

        public UpdateWarehouseZoneCommand(UpdateWarehouseZoneViewModel warehouseZone, Guid id) : base(Guid.NewGuid())
        {
            WarehouseZone = warehouseZone;
            Id = id;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
