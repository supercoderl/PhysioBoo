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
        private readonly IUser _user;

        public CreateLabOrderCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ILabOrderRepository labOrderRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _labOrderRepository = labOrderRepository;
            _user = user;
        }

        public async Task Handle(CreateLabOrderCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            LabOrder newLabOrder = new LabOrder(
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
            );

            newLabOrder.SetTenantId(_user.GetTenantId());
            newLabOrder.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _labOrderRepository.InsertAsync<LabOrder, Guid>(newLabOrder);

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
