using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.MedicalServices.DeleteMedicalService
{
    public sealed class DeleteMedicalServiceCommandHandler : CommandHandlerBase, IRequestHandler<DeleteMedicalServiceCommand>
    {
        private readonly IMedicalServiceRepository _medicalServiceRepository;

        public DeleteMedicalServiceCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IMedicalServiceRepository medicalServiceRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _medicalServiceRepository = medicalServiceRepository;
        }

        public async Task Handle(DeleteMedicalServiceCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            List<Domain.Entities.Operation.MedicalService> services = await _medicalServiceRepository.GetByIdsAsync(request.Ids, cancellationToken);

            foreach (Domain.Entities.Operation.MedicalService service in services)
            {
                _medicalServiceRepository.SoftDeleteSingle(service, false, cancellationToken);
            }

            await CommitAsync();
        }
    }
}