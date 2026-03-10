using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.LabTestCategories.UpdateLabTestCategory
{
    public sealed class UpdateLabTestCategoryCommandHandler : CommandHandlerBase, IRequestHandler<UpdateLabTestCategoryCommand>
    {
        private readonly ILabTestCategoryRepository _labTestCategoryRepository;

        public UpdateLabTestCategoryCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ILabTestCategoryRepository labTestCategoryRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _labTestCategoryRepository = labTestCategoryRepository;
        }

        public async Task Handle(UpdateLabTestCategoryCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.LaboratoryImaging.LabTestCategory? labTestCategory = await _labTestCategoryRepository.GetByIdAsync(request.LabTestCategory.Id);

            if (labTestCategory == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Lab test category with Id {request.LabTestCategory.Id} not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            labTestCategory.SetName(request.LabTestCategory.Name);
            labTestCategory.SetDescription(request.LabTestCategory.Description);
            labTestCategory.SetDepartment(request.LabTestCategory.Department);
            labTestCategory.SetIsActive(request.LabTestCategory.IsActive);

            await _labTestCategoryRepository.UpdateTrackedAsync(labTestCategory, cancellationToken);
        }
    }
}
