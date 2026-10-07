using PhysioBoo.Application.ViewModels.AudienceSegments;

namespace PhysioBoo.Application.Queries.AudienceSegments.GetLookup
{
    public sealed record GetAudienceSegmentsQuery() : IRequest<List<AudienceSegmentViewModel>>;
}
