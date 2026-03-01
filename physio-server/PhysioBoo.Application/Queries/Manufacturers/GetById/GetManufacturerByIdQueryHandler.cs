using MediatR;
using PhysioBoo.Application.ViewModels.Manufacturers;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Support;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Manufacturers.GetAll
{
    public sealed class GetAllManufacturersQueryHandler : IRequestHandler<GetAllManufacturersQuery, PagedResult<ManufacturerViewModel>>
    {
        private readonly IManufacturerRepository _ManufacturerRepository;
        private readonly ISortingExpressionProvider<ManufacturerViewModel, Manufacturer> _sortingExpressionProvider;

        public GetAllManufacturersQueryHandler(
            IManufacturerRepository ManufacturerRepository,
            ISortingExpressionProvider<ManufacturerViewModel, Manufacturer> sortingExpressionProvider
        )
        {
            _ManufacturerRepository = ManufacturerRepository;
            _sortingExpressionProvider = sortingExpressionProvider;
        }

        public async Task<PagedResult<ManufacturerViewModel>> Handle(GetAllManufacturersQuery q, CancellationToken cancellationToken)
        {
            ManufacturersSearchSpec spec = new ManufacturersSearchSpec(q, _sortingExpressionProvider);

            PagedResult<Manufacturer> paged = await _ManufacturerRepository.ListAsync(
                spec,
                q.Request.PageNumber,
                q.Request.PageSize,
                cancellationToken
            );

            // Map to view model
            List<ManufacturerViewModel> items = paged.Items.Select(m => ManufacturerViewModel.FromManufacturer(m)).ToList();
            return new PagedResult<ManufacturerViewModel>(paged.TotalCount, items, q.Request.PageNumber, q.Request.PageSize);
        }
    }
}
