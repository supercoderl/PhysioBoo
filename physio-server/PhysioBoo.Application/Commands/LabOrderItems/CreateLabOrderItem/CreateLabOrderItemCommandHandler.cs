using MediatR;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.LabOrderItems.CreateLabOrderItem
{
    public sealed class CreateLabOrderItemCommandHandler : CommandHandlerBase, IRequestHandler<CreateLabOrderItemCommand>
    {
        private readonly ILabOrderItemRepository _labOrderItemRepository;

        public CreateLabOrderItemCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ILabOrderItemRepository labOrderItemRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _labOrderItemRepository = labOrderItemRepository;
        }

        public async Task Handle(CreateLabOrderItemCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var result = await _labOrderItemRepository.InsertAsync<LabOrderItem, Guid>(new LabOrderItem(
                request.NewLabOrderItem.Id,
                request.NewLabOrderItem.LabOrderId,
                request.NewLabOrderItem.LabTestId,
                request.NewLabOrderItem.TestName,
                request.NewLabOrderItem.IsUrgent,
                request.NewLabOrderItem.SampleCollectionTime,
                request.NewLabOrderItem.SampleCollectorId,
                request.NewLabOrderItem.TestCost,
                request.NewLabOrderItem.ResultValue,
                request.NewLabOrderItem.ResultUnit,
                request.NewLabOrderItem.ReferenceRange,
                request.NewLabOrderItem.AbnormalFlag,
                request.NewLabOrderItem.TechnicianId,
                null,
                null,
                request.NewLabOrderItem.Notes
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
