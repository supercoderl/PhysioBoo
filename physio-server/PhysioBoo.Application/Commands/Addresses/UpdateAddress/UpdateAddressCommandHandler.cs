using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Addresses.UpdateAddress
{
    public sealed class UpdateAddressCommandHandler : CommandHandlerBase, IRequestHandler<UpdateAddressCommand>
    {
        private readonly IAddressRepository _addressRepository;

        public UpdateAddressCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IAddressRepository addressRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _addressRepository = addressRepository;
        }

        public async Task Handle(UpdateAddressCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Core.Address? address = await _addressRepository.GetByIdAsync(request.Id);

            if (address == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Address with Id {request.Id} not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            address.SetAddressType(request.Address.AddressType);
            address.SetStreet(request.Address.Street);
            address.SetApartmentUnit(request.Address.ApartmentUnit);
            address.SetCity(request.Address.City);
            address.SetStateProvince(request.Address.StateProvince);
            address.SetPostalCode(request.Address.PostalCode);
            address.SetCountry(request.Address.Country);
            address.SetLatitude(request.Address.Latitude);
            address.SetLongitude(request.Address.Longitude);
            address.SetIsPrimary(request.Address.IsPrimary);

            await _addressRepository.UpdateTrackedAsync(address, cancellationToken);
        }
    }
}