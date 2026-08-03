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
        private readonly ISys_SequenceTrackerRepository _sys_SequenceTrackerRepository;
        private readonly IUser _user;

        public CreateMedicineCategoryCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IMedicineCategoryRepository medicineCategoryRepository,
            ISys_SequenceTrackerRepository sys_SequenceTrackerRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _medicineCategoryRepository = medicineCategoryRepository;
            _sys_SequenceTrackerRepository = sys_SequenceTrackerRepository;
            _user = user;
        }

        public async Task Handle(CreateMedicineCategoryCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            string newCode = await _sys_SequenceTrackerRepository.GenerateNextCodeAsync(nameof(MedicineCategory), ct);

            MedicineCategory newMedicineCategory = new MedicineCategory(
                request.NewId,
                request.NewMedicineCategory.Name,
                newCode,
                request.NewMedicineCategory.Description,
                request.NewMedicineCategory.ParentCategoryId,
                request.NewMedicineCategory.StorageConditions
            );

            newMedicineCategory.SetIsControlled(request.NewMedicineCategory.IsControlled);
            newMedicineCategory.SetRequiresPrescription(request.NewMedicineCategory.RequiresPrescription);
            newMedicineCategory.SetTenantId(_user.GetTenantId());
            newMedicineCategory.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _medicineCategoryRepository.InsertAsync<MedicineCategory, Guid>(newMedicineCategory);

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
