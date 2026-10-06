using PhysioBoo.Application.ViewModels.Surgeries;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Surgeries.SearchCases
{
    // Every filter is optional. Status accepts a stored status or "Delayed" (derived).
    public sealed record SearchSurgeriesQuery(
        string? Search,
        string? OperatingRoom,
        string? Department,
        string? Surgeon,
        string? Status,
        string? Priority,
        bool? EmergencyOnly,
        DateTime? DateFrom,
        DateTime? DateTo,
        int PageNumber,
        int PageSize
    ) : IRequest<PagedResult<SurgeryRowViewModel>>;
}
