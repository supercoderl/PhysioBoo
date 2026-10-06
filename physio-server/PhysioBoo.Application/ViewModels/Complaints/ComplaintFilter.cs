using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Complaints
{
    public sealed record ComplaintFilter(
        DateTime? Start,
        DateTime? End,
        ComplaintStatus? Status,
        ComplaintPriority? Priority,
        ComplaintCategory? Category
    );
}
