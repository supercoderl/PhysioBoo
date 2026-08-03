using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.MedicineCategories.UpdateMedicineCategory
{
    public sealed class UpdateMedicineCategoryCommandHandler : CommandHandlerBase, IRequestHandler<UpdateMedicineCategoryCommand>
    {
        private readonly IMedicineCategoryRepository _medicineCategoryRepository;

        public UpdateMedicineCategoryCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IMedicineCategoryRepository medicineCategoryRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _medicineCategoryRepository = medicineCategoryRepository;
        }

        public async Task Handle(UpdateMedicineCategoryCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Clinical.MedicineCategory? medicineCategory = await _medicineCategoryRepository.GetByIdAsync(request.Id);

            if (medicineCategory == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Medicine category with Id {request.Id} not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            medicineCategory.SetName(request.MedicineCategory.Name);
            medicineCategory.SetDescription(request.MedicineCategory.Description);
            medicineCategory.SetParentCategoryId(request.MedicineCategory.ParentCategoryId);
            medicineCategory.SetIsControlled(request.MedicineCategory.IsControlled);
            medicineCategory.SetRequiresPrescription(request.MedicineCategory.RequiresPrescription);
            medicineCategory.SetStorageConditions(request.MedicineCategory.StorageConditions);

            await _medicineCategoryRepository.UpdateTrackedAsync(medicineCategory, ct);
        }
    }
}
