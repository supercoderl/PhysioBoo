using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Addresses.DeleteAddress
{
    public sealed class DeleteAddressCommandHandler : CommandHandlerBase, IRequestHandler<DeleteAddressCommand>
    {
        private readonly IAddressRepository _addressRepository;

        public DeleteAddressCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IAddressRepository addressRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _addressRepository = addressRepository;
        }

        public async Task Handle(DeleteAddressCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Core.Address? address = await _addressRepository.GetByIdAsync(request.Id);

            if (address == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Address not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            _addressRepository.SoftDeleteSingle(
                address,
                true,
                cancellationToken
            );

            await CommitAsync();
        }
    }
}