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
        private readonly ISys_SequenceTrackerRepository _sys_SequenceTrackerRepository;

        public CreateManufacturerCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IManufacturerRepository manufacturerRepository,
            ISys_SequenceTrackerRepository sys_SequenceTrackerRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _manufacturerRepository = manufacturerRepository;
            _sys_SequenceTrackerRepository = sys_SequenceTrackerRepository;
        }

        public async Task Handle(CreateManufacturerCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            string newCode = await _sys_SequenceTrackerRepository.GenerateNextCodeAsync(nameof(Manufacturer), cancellationToken);

            Manufacturer newManufacturer = new Manufacturer(
                request.NewId,
                request.NewManufacturer.Name,
                newCode,
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
            );

            newManufacturer.SetGmpCertified(request.NewManufacturer.GmpCertified);
            newManufacturer.SetIsoCertified(request.NewManufacturer.IsoCertified);
            newManufacturer.SetFdaApproved(request.NewManufacturer.FdaApproved);

            SharedKernel.Results.DbResult<Guid> result = await _manufacturerRepository.InsertAsync<Manufacturer, Guid>(newManufacturer);

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
