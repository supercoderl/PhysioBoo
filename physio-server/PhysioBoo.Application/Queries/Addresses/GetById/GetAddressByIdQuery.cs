using MediatR;
using PhysioBoo.Application.ViewModels.Addresses;

namespace PhysioBoo.Application.Queries.Addresses.GetById
{
    public sealed record GetAddressByIdQuery(Guid Id) : IRequest<AddressViewModel?>;
}
