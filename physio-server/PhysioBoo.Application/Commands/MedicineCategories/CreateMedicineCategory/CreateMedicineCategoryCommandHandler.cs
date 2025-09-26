using MediatR;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.MedicineCategories.CreateMedicineCategory
{
    public sealed class CreateMedicineCategoryCommandHandler : CommandHandlerBase, IRequestHandler<CreateMedicineCategoryCommand>
    {
        private readonly IMedicineCategoryRepository _medicineCategoryRepository;

        public CreateMedicineCategoryCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IMedicineCategoryRepository medicineCategoryRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _medicineCategoryRepository = medicineCategoryRepository;
        }

        public async Task Handle(CreateMedicineCategoryCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var result = await _medicineCategoryRepository.InsertAsync<MedicineCategory, Guid>(new MedicineCategory(
                request.NewMedicineCategory.Id,
                request.NewMedicineCategory.Name,
                request.NewMedicineCategory.Code,
                request.NewMedicineCategory.Description,
                request.NewMedicineCategory.ParentCategoryId,
                request.NewMedicineCategory.StorageConditions
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
