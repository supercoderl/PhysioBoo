using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Laboratory.PlaceLabOrder
{
    public sealed class PlaceLabOrderCommandHandler : CommandHandlerBase, IRequestHandler<PlaceLabOrderCommand>
    {
        private readonly IPatientRepository _patientRepository;
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IDoctorRepository _doctorRepository;
        private readonly ILabTestRepository _labTestRepository;
        private readonly ILabOrderRepository _labOrderRepository;
        private readonly ISys_SequenceTrackerRepository _sequenceRepository;
        private readonly IUser _user;

        public PlaceLabOrderCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IPatientRepository patientRepository,
            IAppointmentRepository appointmentRepository,
            IDoctorRepository doctorRepository,
            ILabTestRepository labTestRepository,
            ILabOrderRepository labOrderRepository,
            ISys_SequenceTrackerRepository sequenceRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _patientRepository = patientRepository;
            _appointmentRepository = appointmentRepository;
            _doctorRepository = doctorRepository;
            _labTestRepository = labTestRepository;
            _labOrderRepository = labOrderRepository;
            _sequenceRepository = sequenceRepository;
            _user = user;
        }

        public async Task Handle(PlaceLabOrderCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Guid patientId = request.Order.PatientId;
            if (!await _patientRepository.ExistsAsync(patientId, ct))
            {
                await NotifyAsync(new DomainNotification(request.MessageType, "Patient doesn't exist.", ErrorCodes.ObjectNotFound));
                return;
            }

            OrderContext? context = await OrderContext.ResolveAsync(patientId, _appointmentRepository, _doctorRepository, _user, ct);
            if (context == null)
            {
                await NotifyAsync(new DomainNotification(request.MessageType,
                    "The patient has no visit to attach the order to. Book or check in an appointment first.", ErrorCodes.ObjectNotFound));
                return;
            }

            List<Guid> testIds = request.Order.TestIds!.Distinct().ToList();
            List<LabTest> tests = await _labTestRepository.GetAllNoTracking(t => testIds.Contains(t.Id) && t.IsActive).ToListAsync(ct);
            if (tests.Count != testIds.Count)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, "One or more tests don't exist or are inactive.", ErrorCodes.ObjectNotFound));
                return;
            }

            LabPriority priority = OrderContext.ParsePriority(request.Order.Priority);
            bool urgent = priority != LabPriority.Routine;
            string orderNumber = await _sequenceRepository.GenerateNextCodeAsync(nameof(LabOrder), ct);

            LabOrder order = new LabOrder(
                request.NewId, orderNumber, patientId, context.DoctorId, context.AppointmentId, context.HospitalId,
                request.Order.ClinicalNotes?.Trim(), null, CollectionType.WalkIn, null, null, null, null);
            order.SetLabPriority(priority);
            order.SetTenantId(_user.GetTenantId());
            order.SetCreatedBy(_user.GetUserId());

            List<LabOrderItem> items = tests.Select(t =>
            {
                decimal cost = urgent && t.IsUrgentAvailable && t.UrgentCost > 0 ? t.UrgentCost : t.Cost;
                LabOrderItem item = new LabOrderItem(
                    Guid.NewGuid(), order.Id, t.Id, t.TestName, urgent, null, null, cost,
                    null, t.UnitOfMeasurement, null, null, null, null, null, null);
                item.SetTenantId(_user.GetTenantId());
                item.SetCreatedBy(_user.GetUserId());
                return item;
            }).ToList();

            order.SetTotalAmount(items.Sum(i => i.TestCost));

            await _labOrderRepository.AddWithItemsAsync(order, items, ct);
        }
    }
}
