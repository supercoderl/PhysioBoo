using PhysioBoo.Application.ViewModels.TreatmentSheet;

namespace PhysioBoo.Application.Queries.TreatmentSheet.GetStats
{
    public sealed record GetTreatmentStatsQuery(Guid PatientId) : IRequest<TreatmentStatsViewModel>;
}
