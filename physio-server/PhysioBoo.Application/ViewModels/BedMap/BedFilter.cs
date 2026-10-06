namespace PhysioBoo.Application.ViewModels.BedMap
{
    public sealed record BedFilter(
        Guid? WardId,
        string? Status,
        int? Floor,
        string? Search
    );
}
