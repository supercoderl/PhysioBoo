using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Radiology.PlaceImagingOrder
{
    public sealed class PlaceImagingOrderCommandHandler : CommandHandlerBase, IRequestHandler<PlaceImagingOrderCommand>
    {
        private readonly IPatientRepository _patientRepository;
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IDoctorRepository _doctorRepository;
        private readonly IImagingModalityRepository _modalityRepository;
        private readonly IImagingOrderRepository _imagingOrderRepository;
        private readonly ISys_SequenceTrackerRepository _sequenceRepository;
        private readonly IUser _user;

        public PlaceImagingOrderCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IPatientRepository patientRepository,
            IAppointmentRepository appointmentRepository,
            IDoctorRepository doctorRepository,
            IImagingModalityRepository modalityRepository,
            IImagingOrderRepository imagingOrderRepository,
            ISys_SequenceTrackerRepository sequenceRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _patientRepository = patientRepository;
            _appointmentRepository = appointmentRepository;
            _doctorRepository = doctorRepository;
            _modalityRepository = modalityRepository;
            _imagingOrderRepository = imagingOrderRepository;
            _sequenceRepository = sequenceRepository;
            _user = user;
        }

        public async Task Handle(PlaceImagingOrderCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Guid patientId = request.Order.PatientId;
            if (!await _patientRepository.ExistsAsync(patientId, ct))
            {
                await NotifyAsync(new DomainNotification(request.MessageType, "Patient doesn't exist.", ErrorCodes.ObjectNotFound));
                return;
            }

            ImagingModality? modality = await _modalityRepository.GetAllNoTracking(m => m.Id == request.Order.ModalityId && m.IsActive).FirstOrDefaultAsync(ct);
            if (modality == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, "Modality doesn't exist or is inactive.", ErrorCodes.ObjectNotFound));
                return;
            }

            OrderContext? context = await OrderContext.ResolveAsync(patientId, _appointmentRepository, _doctorRepository, _user, ct);
            if (context == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType,
                    "The patient has no visit to attach the order to. Book or check in an appointment first.", ErrorCodes.ObjectNotFound));
                return;
            }

            string orderNumber = await _sequenceRepository.GenerateNextCodeAsync(nameof(ImagingOrder), ct);

            ImagingOrder order = new ImagingOrder(
                request.NewId, orderNumber, patientId, context.DoctorId, context.AppointmentId, context.HospitalId, modality.Id,
                request.Order.BodyPart?.Trim(), request.Order.ClinicalIndication?.Trim(), null, null, null,
                request.Order.ContrastRequired ? "Per protocol" : null,
                null, null, Math.Max(15, modality.AverageDurationMinutes), 0, 0, null, PregnancyStatus.Unknown, false, null, null, null);
            order.SetLabPriority(OrderContext.ParsePriority(request.Order.Priority));
            order.SetTenantId(_user.GetTenantId());
            order.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> result = await _imagingOrderRepository.InsertAsync<ImagingOrder, Guid>(order);
            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Failed to place the order: {result.Error}", ErrorCodes.CommitFailed));
            }
        }
    }
}
