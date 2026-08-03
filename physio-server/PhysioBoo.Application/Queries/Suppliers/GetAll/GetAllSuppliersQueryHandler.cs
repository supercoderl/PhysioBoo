using MediatR;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Application.ViewModels.Suppliers;
using PhysioBoo.Domain.Entities.Support;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Suppliers.GetAll
{
    public sealed class GetAllSuppliersQueryHandler : IRequestHandler<GetAllSuppliersQuery, PagedResult<SupplierViewModel>>
    {
        private readonly ISupplierRepository _supplierRepository;
        private readonly ISortingExpressionProvider<SupplierViewModel, Supplier> _sortingExpressionProvider;

        public GetAllSuppliersQueryHandler(
            ISupplierRepository supplierRepository,
            ISortingExpressionProvider<SupplierViewModel, Supplier> sortingExpressionProvider
        )
        {
            _supplierRepository = supplierRepository;
            _sortingExpressionProvider = sortingExpressionProvider;
        }

        public async Task<PagedResult<SupplierViewModel>> Handle(GetAllSuppliersQuery q, CancellationToken ct)
        {
            SuppliersSearchSpec spec = new SuppliersSearchSpec(q, _sortingExpressionProvider);

            PagedResult<Supplier> paged = await _supplierRepository.ListAsync(
                spec,
                q.Request.PageNumber,
                q.Request.PageSize,
                ct
            );

            // Map to view model
            List<SupplierViewModel> items = paged.Items.Select(s => SupplierViewModel.FromSupplier(s)).ToList();
            return new PagedResult<SupplierViewModel>(paged.TotalCount, items, q.Request.PageNumber, q.Request.PageSize);
        }
    }
}
