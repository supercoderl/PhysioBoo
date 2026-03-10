using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Manufacturers.UpdateManufacturer
{
    public sealed class UpdateManufacturerCommandHandler : CommandHandlerBase, IRequestHandler<UpdateManufacturerCommand>
    {
        private readonly IManufacturerRepository _manufacturerRepository;

        public UpdateManufacturerCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IManufacturerRepository manufacturerRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _manufacturerRepository = manufacturerRepository;
        }

        public async Task Handle(UpdateManufacturerCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Support.Manufacturer? manufacturer = await _manufacturerRepository.GetByIdAsync(request.Manufacturer.Id);

            if (manufacturer == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Manufacturer with Id {request.Manufacturer.Id} not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            manufacturer.SetName(request.Manufacturer.Name);
            manufacturer.SetAddress(request.Manufacturer.Address);
            manufacturer.SetCity(request.Manufacturer.City);
            manufacturer.SetState(request.Manufacturer.State);
            manufacturer.SetCountry(request.Manufacturer.Country);
            manufacturer.SetPostalCode(request.Manufacturer.PostalCode);
            manufacturer.SetPhone(request.Manufacturer.Phone);
            manufacturer.SetEmail(request.Manufacturer.Email);
            manufacturer.SetWebsite(request.Manufacturer.Website);
            manufacturer.SetLicenseNumber(request.Manufacturer.LicenseNumber);
            manufacturer.SetGmpCertified(request.Manufacturer.GmpCertified);
            manufacturer.SetIsoCertified(request.Manufacturer.IsoCertified);
            manufacturer.SetFdaApproved(request.Manufacturer.FdaApproved);
            manufacturer.SetEstablishedYear(request.Manufacturer.EstablishedYear);
            manufacturer.SetIsActive(request.Manufacturer.IsActive);

            await _manufacturerRepository.UpdateTrackedAsync(manufacturer, cancellationToken);
        }
    }
}
