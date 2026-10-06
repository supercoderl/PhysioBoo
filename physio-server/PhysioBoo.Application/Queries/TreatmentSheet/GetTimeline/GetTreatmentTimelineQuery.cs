using PhysioBoo.Application.ViewModels.TreatmentSheet;

namespace PhysioBoo.Application.Queries.TreatmentSheet.GetTimeline
{
    // Range: Today | Last24Hours | Last7Days | Custom (Custom needs From and To).
    public sealed record GetTreatmentTimelineQuery(Guid PatientId, string Range, DateTime? From, DateTime? To)
        : IRequest<List<TreatmentTimelineEntryViewModel>>;
}
