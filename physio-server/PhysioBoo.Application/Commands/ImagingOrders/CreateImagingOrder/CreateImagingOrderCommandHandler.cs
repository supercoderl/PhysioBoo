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

        public CreateImagingOrderCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IImagingOrderRepository imagingOrderRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _imagingOrderRepository = imagingOrderRepository;
        }

        public async Task Handle(CreateImagingOrderCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            var result = await _imagingOrderRepository.InsertAsync<ImagingOrder, Guid>(new ImagingOrder(
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
                request.NewImagingOrder.RadiologistId,
                request.UserId
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
