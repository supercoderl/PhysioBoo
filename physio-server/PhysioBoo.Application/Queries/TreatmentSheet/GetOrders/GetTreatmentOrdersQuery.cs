using PhysioBoo.Application.ViewModels.TreatmentSheet;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.TreatmentSheet.GetOrders
{
    public sealed record GetTreatmentOrdersQuery(Guid PatientId, int PageNumber, int PageSize) : IRequest<PagedResult<TreatmentOrderViewModel>>;
}
