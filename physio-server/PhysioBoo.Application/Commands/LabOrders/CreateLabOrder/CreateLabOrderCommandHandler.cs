using MediatR;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.LabOrders.CreateLabOrder
{
    public sealed class CreateLabOrderCommandHandler : CommandHandlerBase, IRequestHandler<CreateLabOrderCommand>
    {
        private readonly ILabOrderRepository _labOrderRepository;

        public CreateLabOrderCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ILabOrderRepository labOrderRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _labOrderRepository = labOrderRepository;
        }

        public async Task Handle(CreateLabOrderCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var result = await _labOrderRepository.InsertAsync<LabOrder, Guid>(new LabOrder(
                request.NewLabOrder.Id,
                request.NewLabOrder.OrderNumber,
                request.NewLabOrder.PatientId,
                request.NewLabOrder.DoctorId,
                request.NewLabOrder.AppointmentId,
                request.NewLabOrder.HospitalId,
                request.NewLabOrder.ClinicalHistory,
                request.NewLabOrder.PrivisionalDiagnosis,
                request.NewLabOrder.CollectionType,
                request.NewLabOrder.CollectionDate,
                request.NewLabOrder.CollectionTime,
                request.NewLabOrder.CollectionAddress,
                request.NewLabOrder.SpecialInstructions
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
