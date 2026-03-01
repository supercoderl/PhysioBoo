using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.MedicineCategories.DeleteMedicineCategory
{
    public sealed class DeleteMedicineCategoryCommandHandler : CommandHandlerBase, IRequestHandler<DeleteMedicineCategoryCommand>
    {
        private readonly IMedicineCategoryRepository _medicineCategoryRepository;

        public DeleteMedicineCategoryCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IMedicineCategoryRepository medicineCategoryRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _medicineCategoryRepository = medicineCategoryRepository;
        }

        public async Task Handle(DeleteMedicineCategoryCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Clinical.MedicineCategory? medicineCategory = await _medicineCategoryRepository.GetByIdAsync(request.Id);

            if (medicineCategory == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Medicine category not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            _medicineCategoryRepository.SoftDeleteSingle(
                medicineCategory,
                request.IsHard,
                cancellationToken
            );

            await CommitAsync();
        }
    }
}
