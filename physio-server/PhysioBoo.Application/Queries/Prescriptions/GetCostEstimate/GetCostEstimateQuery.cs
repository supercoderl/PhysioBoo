
using PhysioBoo.Application.ViewModels.Prescriptions;

namespace PhysioBoo.Application.Queries.Prescriptions.GetCostEstimate
{
    public sealed record GetCostEstimateQuery(
        Guid PrescriptionId,
        List<CostEstimateItemInput> Items
    ) : IRequest<PrescriptionSummaryTotalsViewModel?>;
}
