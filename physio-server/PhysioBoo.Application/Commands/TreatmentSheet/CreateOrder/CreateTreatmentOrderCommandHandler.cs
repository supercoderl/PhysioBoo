using PhysioBoo.Application.ViewModels.TreatmentSheet;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.TreatmentSheet.CreateOrder
{
    public sealed class CreateTreatmentOrderCommandHandler : CommandHandlerBase, IRequestHandler<CreateTreatmentOrderCommand>
    {
        private readonly ITreatmentOrderRepository _orderRepository;
        private readonly IPatientRepository _patientRepository;
        private readonly IUser _user;

        public CreateTreatmentOrderCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ITreatmentOrderRepository orderRepository,
            IPatientRepository patientRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _orderRepository = orderRepository;
            _patientRepository = patientRepository;
            _user = user;
        }

        public async Task Handle(CreateTreatmentOrderCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            if (!await _patientRepository.ExistsAsync(request.PatientId, cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Patient with id {request.PatientId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            var input = request.Input;

            TreatmentOrder order = new TreatmentOrder(
                Guid.NewGuid(),
                request.PatientId,
                Enum.Parse<TreatmentOrderType>(input.OrderType, true),
                input.OrderName.Trim(),
                Enum.Parse<TreatmentOrderPriority>(input.Priority, true),
                string.IsNullOrWhiteSpace(input.Frequency) ? null : input.Frequency.Trim(),
                input.StartTime,
                input.EndTime,
                _user.Name,
                string.IsNullOrWhiteSpace(input.Status) ? TreatmentOrderStatus.Active : Enum.Parse<TreatmentOrderStatus>(input.Status, true)
            );
            order.SetTenantId(_user.GetTenantId());
            order.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _orderRepository.InsertAsync<TreatmentOrder, Guid>(order);
            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Failed to create the order: {result.Error}",
                    ErrorCodes.CommitFailed
                ));
                return;
            }

            request.Result = TreatmentOrderViewModel.FromEntity(order);
        }
    }
}
