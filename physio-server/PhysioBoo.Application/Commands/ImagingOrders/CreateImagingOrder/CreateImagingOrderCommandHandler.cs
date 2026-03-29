using MediatR;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.Commands.ImagingOrders.CreateImagingOrder
{
    public sealed class CreateImagingOrderCommandHandler : CommandHandlerBase, IRequestHandler<CreateImagingOrderCommand>
    {
        private readonly IImagingOrderRepository _imagingOrderRepository;
        private readonly IUser _user;

        public CreateImagingOrderCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IImagingOrderRepository imagingOrderRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _imagingOrderRepository = imagingOrderRepository;
            _user = user;
        }

        public async Task Handle(CreateImagingOrderCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            ImagingOrder newImagingOrder = new ImagingOrder(
                request.NewImagingOrder.Id,
                TextHelper.GenerateEntityNumber("ORD"),
                request.NewImagingOrder.PatientId,
                request.NewImagingOrder.DoctorId,
                request.NewImagingOrder.AppointmentId,
                request.NewImagingOrder.HospitalId,
                request.NewImagingOrder.ModalityId,
                request.NewImagingOrder.BodyPart,
                request.NewImagingOrder.ClinicalIndication,
                request.NewImagingOrder.ClinicalHistory,
                request.NewImagingOrder.ProvisionalDiagnosis,
                request.NewImagingOrder.SpecificQuestions,
                request.NewImagingOrder.ContrastType,
                request.NewImagingOrder.ScheduledDate,
                request.NewImagingOrder.ScheduledTime,
                request.NewImagingOrder.EstimatedDuration,
                request.NewImagingOrder.PatientWeight,
                request.NewImagingOrder.PatientHeight,
                request.NewImagingOrder.AllergiesNoted,
                request.NewImagingOrder.PregnancyStatus,
                request.NewImagingOrder.ImplantsPresent,
                request.NewImagingOrder.ImplantDetails,
                request.NewImagingOrder.TechnicianId,
                request.NewImagingOrder.RadiologistId
            );

            newImagingOrder.SetTenantId(_user.GetTenantId());
            newImagingOrder.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _imagingOrderRepository.InsertAsync<ImagingOrder, Guid>(newImagingOrder);

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
