using MediatR;
using PhysioBoo.Application.ViewModels.Addresses;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Addresses.GetAll
{
    public sealed record GetAllAddressesQuery(
        PagedRequest<AddressFilter> Request
    ) : IRequest<PagedResult<AddressViewModel>>;
}
