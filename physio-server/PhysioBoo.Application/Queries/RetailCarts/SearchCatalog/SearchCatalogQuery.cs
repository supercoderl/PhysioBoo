
using PhysioBoo.Application.ViewModels.Retail;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.RetailCarts.SearchCatalog
{
    public sealed record SearchCatalogQuery(PagedRequest<RetailCatalogFilter> Request) : IRequest<PagedResult<RetailMedicineCardViewModel>>;
}
