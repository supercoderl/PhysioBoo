using MediatR;
using PhysioBoo.Application.ViewModels.Suppliers;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Suppliers.GetAll
{
    public sealed record GetAllSuppliersQuery(
        PagedRequest<SupplierFilter> Request
    ) : IRequest<PagedResult<SupplierViewModel>>;
}
