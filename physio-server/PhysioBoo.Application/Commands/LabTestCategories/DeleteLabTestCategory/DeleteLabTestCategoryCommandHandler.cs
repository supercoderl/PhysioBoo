using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.LabTestCategories.DeleteLabTestCategory
{
    public sealed class DeleteLabTestCategoryCommandHandler : CommandHandlerBase, IRequestHandler<DeleteLabTestCategoryCommand>
    {
        private readonly ILabTestCategoryRepository _labTestCategoryRepository;

        public DeleteLabTestCategoryCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ILabTestCategoryRepository labTestCategoryRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _labTestCategoryRepository = labTestCategoryRepository;
        }

        public async Task Handle(DeleteLabTestCategoryCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.LaboratoryImaging.LabTestCategory? labTestCategory = await _labTestCategoryRepository.GetByIdAsync(request.Id);

            if (labTestCategory == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Lab test category not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            _labTestCategoryRepository.SoftDeleteSingle(
                labTestCategory,
                request.IsHard,
                cancellationToken
            );

            await CommitAsync();
        }
    }
}
