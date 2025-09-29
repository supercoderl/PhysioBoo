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

        public CreateLabTestCategoryCommandHandler(
            IMediatorHandler bus,
             IUnitOfWork unitOfWork,
             INotificationHandler<DomainNotification> notifications,
             ILabTestCategoryRepository labTestCategoryRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _labTestCategoryRepository = labTestCategoryRepository;
        }

        public async Task Handle(CreateLabTestCategoryCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            SharedKernel.Results.DbResult<Guid> result = await _labTestCategoryRepository.InsertAsync<LabTestCategory, Guid>(new LabTestCategory(
                request.NewLabTestCategory.Id,
                request.NewLabTestCategory.Name,
                request.NewLabTestCategory.Code,
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
