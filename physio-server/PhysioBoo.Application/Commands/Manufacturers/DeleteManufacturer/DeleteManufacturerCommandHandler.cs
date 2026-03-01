using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Manufacturers.DeleteManufacturer
{
    public sealed class DeleteManufacturerCommandHandler : CommandHandlerBase, IRequestHandler<DeleteManufacturerCommand>
    {
        private readonly IManufacturerRepository _manufacturerRepository;

        public DeleteManufacturerCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IManufacturerRepository manufacturerRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _manufacturerRepository = manufacturerRepository;
        }

        public async Task Handle(DeleteManufacturerCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Support.Manufacturer? manufacturer = await _manufacturerRepository.GetByIdAsync(request.Id);

            if (manufacturer == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Manufacturer not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            _manufacturerRepository.SoftDeleteSingle(
                manufacturer,
                request.IsHard,
                cancellationToken
            );

            await CommitAsync();
        }
    }
}
