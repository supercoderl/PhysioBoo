
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Medicines.DeleteMedicine
{
    public sealed class DeleteMedicineCommandHandler : CommandHandlerBase, IRequestHandler<DeleteMedicineCommand>
    {
        private readonly IMedicineRepository _medicineRepository;

        public DeleteMedicineCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IMedicineRepository medicineRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _medicineRepository = medicineRepository;
        }

        public async Task Handle(DeleteMedicineCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Clinical.Medicine? medicine = await _medicineRepository.GetByIdAsync(request.Id);

            if (medicine == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Medicine not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            _medicineRepository.SoftDeleteSingle(
                medicine,
                request.IsHard,
                ct
            );

            await CommitAsync();
        }
    }
}
