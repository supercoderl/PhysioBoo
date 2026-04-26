using MediatR;
using PhysioBoo.Application.ViewModels.Addresses;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Queries.Addresses.GetById
{
    public sealed class GetAddressByIdQueryHandler : IRequestHandler<GetAddressByIdQuery, AddressViewModel?>
    {
        private readonly IMediatorHandler _bus;
        private readonly IAddressRepository _addressRepository;

        public GetAddressByIdQueryHandler(
            IMediatorHandler bus,
            IAddressRepository addressRepository
        )
        {
            _bus = bus;
            _addressRepository = addressRepository;
        }

        public async Task<AddressViewModel?> Handle(GetAddressByIdQuery request, CancellationToken cancellationToken)
        {
            Address? address = await _addressRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken);

            if (address == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetAddressByIdQuery),
                    $"Address with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));

                return null;
            }

            return AddressViewModel.FromAddress(address);
        }
    }
}
