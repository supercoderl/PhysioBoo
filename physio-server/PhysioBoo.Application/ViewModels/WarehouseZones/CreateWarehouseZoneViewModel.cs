using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.WarehouseZones
{
    public sealed record CreateWarehouseZoneViewModel
    (
        Guid Id,
        Guid HospitalId,
        string Name,
        WarehouseZoneType Type
    );
}
