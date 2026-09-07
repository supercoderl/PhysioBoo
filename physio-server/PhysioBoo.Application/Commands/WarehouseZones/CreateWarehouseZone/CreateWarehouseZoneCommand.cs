
using PhysioBoo.Application.ViewModels.WarehouseZones;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.WarehouseZones.CreateWarehouseZone
{
    public sealed class CreateWarehouseZoneCommand : CommandBase, IRequest
    {
        private static readonly CreateWarehouseZoneCommandValidation s_validation = new();

        public CreateWarehouseZoneViewModel NewWarehouseZone { get; }

        public CreateWarehouseZoneCommand(CreateWarehouseZoneViewModel newWarehouseZone) : base(Guid.NewGuid())
        {
            NewWarehouseZone = newWarehouseZone;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
