namespace PhysioBoo.Application.ViewModels.AudienceSegments
{
    public sealed record AudienceSegmentViewModel(
        Guid Id,
        string Name,
        int Count,
        string Criteria
    );
}
