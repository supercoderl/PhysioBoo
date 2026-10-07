using PhysioBoo.Application.ViewModels.Laboratory;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Laboratory.GetOrders
{
    public sealed record GetLabOrdersQuery(int PageNumber, int PageSize) : IRequest<PagedResult<LabOrderRowViewModel>>;
}
