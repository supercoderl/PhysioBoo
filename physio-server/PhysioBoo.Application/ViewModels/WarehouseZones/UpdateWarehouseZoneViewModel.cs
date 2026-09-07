using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.WarehouseZones
{
    public sealed record UpdateWarehouseZoneViewModel
    (
        string Name,
        WarehouseZoneType Type
    );
}
