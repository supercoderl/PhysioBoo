using MediatR;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.LabTestCategories.CreateLabTestCategory
{
    public sealed class CreateLabTestCategoryCommandHandler : CommandHandlerBase, IRequestHandler<CreateLabTestCategoryCommand>
    {
        private readonly ILabTestCategoryRepository _labTestCategoryRepository;
        private readonly ISys_SequenceTrackerRepository _sys_SequenceTrackerRepository;

        public CreateLabTestCategoryCommandHandler(
            IMediatorHandler bus,
             IUnitOfWork unitOfWork,
             INotificationHandler<DomainNotification> notifications,
             ILabTestCategoryRepository labTestCategoryRepository,
             ISys_SequenceTrackerRepository sys_SequenceTrackerRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _labTestCategoryRepository = labTestCategoryRepository;
            _sys_SequenceTrackerRepository = sys_SequenceTrackerRepository;
        }

        public async Task Handle(CreateLabTestCategoryCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            string newCode = await _sys_SequenceTrackerRepository.GenerateNextCodeAsync(nameof(LabTestCategory), cancellationToken);

            SharedKernel.Results.DbResult<Guid> result = await _labTestCategoryRepository.InsertAsync<LabTestCategory, Guid>(new LabTestCategory(
                request.NewId,
                request.NewLabTestCategory.Name,
                newCode,
                request.NewLabTestCategory.Description,
                request.NewLabTestCategory.Department
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
