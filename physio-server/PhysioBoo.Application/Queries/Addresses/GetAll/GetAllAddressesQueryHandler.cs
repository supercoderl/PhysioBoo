using MediatR;
using PhysioBoo.Application.ViewModels.Addresses;
using PhysioBoo.Application.ViewModels.Sorting;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Addresses.GetAll
{
    public sealed class GetAllAddressesQueryHandler : IRequestHandler<GetAllAddressesQuery, PagedResult<AddressViewModel>>
    {
        private readonly IAddressRepository _addressRepository;
        private readonly ISortingExpressionProvider<AddressViewModel, Address> _sortingExpressionProvider;

        public GetAllAddressesQueryHandler(
            IAddressRepository addressRepository,
            ISortingExpressionProvider<AddressViewModel, Address> sortingExpressionProvider
        )
        {
            _addressRepository = addressRepository;
            _sortingExpressionProvider = sortingExpressionProvider;
        }

        public async Task<PagedResult<AddressViewModel>> Handle(GetAllAddressesQuery q, CancellationToken cancellationToken)
        {
            AddressesSearchSpec spec = new AddressesSearchSpec(q, _sortingExpressionProvider);

            PagedResult<Address> paged = await _addressRepository.ListAsync(
                spec,
                q.Request.PageNumber,
                q.Request.PageSize,
                cancellationToken
            );

            // Map to view model
            List<AddressViewModel> items = paged.Items.Select(a => AddressViewModel.FromAddress(a)).ToList();
            return new PagedResult<AddressViewModel>(paged.TotalCount, items, q.Request.PageNumber, q.Request.PageSize);
        }
    }
}
