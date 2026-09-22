using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.MedicalServices.ChangeMedicalServiceStatus
{
    public sealed class ChangeMedicalServiceStatusCommandHandler : CommandHandlerBase, IRequestHandler<ChangeMedicalServiceStatusCommand>
    {
        private readonly IMedicalServiceRepository _medicalServiceRepository;
        private readonly IUser _user;

        public ChangeMedicalServiceStatusCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IMedicalServiceRepository medicalServiceRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _medicalServiceRepository = medicalServiceRepository;
            _user = user;
        }

        public async Task Handle(ChangeMedicalServiceStatusCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            List<Domain.Entities.Operation.MedicalService> services = await _medicalServiceRepository.GetByIdsAsync(request.Ids, cancellationToken);

            foreach (Domain.Entities.Operation.MedicalService service in services)
            {
                switch (request.TargetStatus)
                {
                    case ServiceStatus.Archived:
                        service.Archive();
                        break;
                    case ServiceStatus.Draft:
                        service.Restore();
                        break;
                    case ServiceStatus.Active:
                        service.Publish();
                        break;
                }
                service.SetUpdatedBy(_user.GetUserId());
                await _medicalServiceRepository.UpdateTrackedAsync(service, cancellationToken);
            }
        }
    }
}