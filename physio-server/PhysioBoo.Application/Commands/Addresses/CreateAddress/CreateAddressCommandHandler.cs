using MediatR;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Addresses.CreateAddress
{
    public sealed class CreateAddressCommandHandler : CommandHandlerBase, IRequestHandler<CreateAddressCommand>
    {
        private readonly IAddressRepository _addressRepository;

        public CreateAddressCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IAddressRepository addressRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _addressRepository = addressRepository;
        }

        public async Task Handle(CreateAddressCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var result = await _addressRepository.InsertAsync<Address, Guid>(new Address(
                request.NewAddress.Id,
                request.UserId,
                request.NewAddress.Street,
                request.NewAddress.ApartmentUnit,
                request.NewAddress.City,
                request.NewAddress.StateProvince,
                request.NewAddress.PostalCode,
                request.NewAddress.Country,
                request.NewAddress.Latitude,
                request.NewAddress.Longitude
            ));

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));

                return;
            }
        }
    }
}
