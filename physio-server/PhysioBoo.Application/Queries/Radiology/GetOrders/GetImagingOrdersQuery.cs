using PhysioBoo.Application.ViewModels.Radiology;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Radiology.GetOrders
{
    public sealed record GetImagingOrdersQuery(int PageNumber, int PageSize) : IRequest<PagedResult<ImagingOrderRowViewModel>>;
}
