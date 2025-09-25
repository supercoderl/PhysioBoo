using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.BillItems
{
    public sealed record CreateBillItemViewModel
    (
        Guid Id,
        Guid BillId,
        ItemType Type,
        string? ItemCode,
        string? ItemName,
        string? Description,
        decimal UnitPrice,
        decimal TotalAmount,
        Guid? PerformedBy,
        DateTime? PerformedDate,
        Guid? ReferenceId
    );
}
