using MediatR;
using PhysioBoo.Domain.Entities.Support;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Manufacturers.CreateManufacturer
{
    public sealed class CreateManufacturerCommandHandler : CommandHandlerBase, IRequestHandler<CreateManufacturerCommand>
    {
        private readonly IManufacturerRepository _manufacturerRepository;

        public CreateManufacturerCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IManufacturerRepository manufacturerRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _manufacturerRepository = manufacturerRepository;
        }

        public async Task Handle(CreateManufacturerCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var result = await _manufacturerRepository.InsertAsync<Manufacturer, Guid>(new Manufacturer(
                request.NewManufacturer.Id,
                request.NewManufacturer.Name,
                request.NewManufacturer.CompanyCode,
                request.NewManufacturer.Address,
                request.NewManufacturer.City,
                request.NewManufacturer.State,
                request.NewManufacturer.Country,
                request.NewManufacturer.PostalCode,
                request.NewManufacturer.Phone,
                request.NewManufacturer.Email,
                request.NewManufacturer.Website,
                request.NewManufacturer.LicenseNumber,
                request.NewManufacturer.EstablishedYear
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
