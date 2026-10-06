using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.TreatmentSheet;
using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.TreatmentSheet.GetTimeline
{
    // One merged, newest-first feed of everything recorded for the patient in the chosen window.
    public sealed class GetTreatmentTimelineQueryHandler : IRequestHandler<GetTreatmentTimelineQuery, List<TreatmentTimelineEntryViewModel>>
    {
        private const int MaxEntries = 200;

        private readonly ITreatmentOrderRepository _orderRepository;
        private readonly IMedicationAdministrationRepository _medicationRepository;
        private readonly ITreatmentProcedureRepository _procedureRepository;
        private readonly ILabOrderItemRepository _labOrderItemRepository;
        private readonly IImagingOrderRepository _imagingOrderRepository;
        private readonly IClinicalNoteRepository _noteRepository;
        private readonly INursingTaskRepository _taskRepository;
        private readonly IMediatorHandler _bus;

        public GetTreatmentTimelineQueryHandler(
            ITreatmentOrderRepository orderRepository,
            IMedicationAdministrationRepository medicationRepository,
            ITreatmentProcedureRepository procedureRepository,
            ILabOrderItemRepository labOrderItemRepository,
            IImagingOrderRepository imagingOrderRepository,
            IClinicalNoteRepository noteRepository,
            INursingTaskRepository taskRepository,
            IMediatorHandler bus
        )
        {
            _orderRepository = orderRepository;
            _medicationRepository = medicationRepository;
            _procedureRepository = procedureRepository;
            _labOrderItemRepository = labOrderItemRepository;
            _imagingOrderRepository = imagingOrderRepository;
            _noteRepository = noteRepository;
            _taskRepository = taskRepository;
            _bus = bus;
        }

        public async Task<List<TreatmentTimelineEntryViewModel>> Handle(GetTreatmentTimelineQuery request, CancellationToken cancellationToken)
        {
            DateTime now = TimeZoneHelper.GetLocalTimeNow();
            (DateTime start, DateTime end)? window = ResolveWindow(request, now);
            if (window == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetTreatmentTimelineQuery),
                    "Range must be Today, Last24Hours, Last7Days, or Custom with a valid From and To.",
                    DomainErrorCodes.Treatment.InvalidRange
                ));
                return new List<TreatmentTimelineEntryViewModel>();
            }

            DateTime windowStart = window.Value.start;
            DateTime windowEnd = window.Value.end;
            Guid patientId = request.PatientId;
            DateOnly fromDate = DateOnly.FromDateTime(windowStart);
            DateOnly toDate = DateOnly.FromDateTime(windowEnd);

            List<TreatmentOrder> orders = await _orderRepository
                .GetAllNoTracking(o => o.PatientId == patientId && o.StartTime >= windowStart && o.StartTime <= windowEnd)
                .ToListAsync(cancellationToken);

            List<MedicationAdministration> doses = await _medicationRepository
                .GetAllNoTracking(m => m.PatientId == patientId && m.ScheduledAt >= windowStart && m.ScheduledAt <= windowEnd)
                .ToListAsync(cancellationToken);

            List<TreatmentProcedure> procedures = await _procedureRepository
                .GetAllNoTracking(p => p.PatientId == patientId && p.ScheduledAt >= windowStart && p.ScheduledAt <= windowEnd)
                .ToListAsync(cancellationToken);

            List<LabOrderItem> labs = await _labOrderItemRepository
                .GetAllNoTracking(
                    i => i.LabOrder!.PatientId == patientId && i.LabOrder.OrderDate >= fromDate && i.LabOrder.OrderDate <= toDate,
                    includeProperties: "LabOrder")
                .ToListAsync(cancellationToken);

            List<ImagingOrder> imaging = await _imagingOrderRepository
                .GetAllNoTracking(o => o.PatientId == patientId && o.CreatedAt >= windowStart && o.CreatedAt <= windowEnd, includeProperties: "Modality")
                .ToListAsync(cancellationToken);

            List<ClinicalNote> notes = await _noteRepository
                .GetAllNoTracking(n => n.PatientId == patientId && n.CreatedAt >= windowStart && n.CreatedAt <= windowEnd)
                .ToListAsync(cancellationToken);

            List<NursingTask> doneTasks = await _taskRepository
                .GetAllNoTracking(t => t.PatientId == patientId && t.Status == NursingTaskStatus.Completed
                                       && t.CompletedAt != null && t.CompletedAt >= windowStart && t.CompletedAt <= windowEnd)
                .ToListAsync(cancellationToken);

            List<TreatmentTimelineEntryViewModel> entries = new();

            entries.AddRange(orders.Select(o => new TreatmentTimelineEntryViewModel
            {
                Id = $"order-{o.Id}",
                Category = o.OrderType == TreatmentOrderType.Medication ? "MedicationOrder" : "DoctorOrder",
                Title = o.OrderName,
                Detail = string.Join(" · ", new[] { o.OrderType.ToString(), o.Priority.ToString(), o.Frequency }.Where(x => !string.IsNullOrWhiteSpace(x))),
                OccurredAt = o.StartTime,
                ActorName = o.OrderingDoctorName,
                Status = o.Status.ToString()
            }));

            entries.AddRange(doses.Select(m => new TreatmentTimelineEntryViewModel
            {
                Id = $"dose-{m.Id}",
                Category = "MedicationOrder",
                Title = $"{m.MedicationName} {m.Dose}",
                Detail = $"{m.Route} · {m.Frequency}",
                OccurredAt = m.AdministeredAt ?? m.ScheduledAt,
                ActorName = m.AdministeredByName,
                Status = m.Status.ToString()
            }));

            entries.AddRange(procedures.Select(p => new TreatmentTimelineEntryViewModel
            {
                Id = $"procedure-{p.Id}",
                Category = "Procedure",
                Title = p.Name,
                Detail = p.Department,
                OccurredAt = p.CompletedAt ?? p.ScheduledAt,
                ActorName = p.PerformerName,
                Status = p.Status.ToString()
            }));

            entries.AddRange(labs.Select(i =>
            {
                TreatmentLabOrderRowViewModel row = TreatmentLabOrderRowViewModel.FromEntity(i);
                return new TreatmentTimelineEntryViewModel
                {
                    Id = $"lab-{i.Id}",
                    Category = "LabOrder",
                    Title = i.TestName,
                    Detail = $"Sample {row.SampleStatus} · Result {row.ResultStatus}",
                    OccurredAt = row.OrderedAt,
                    Status = row.ResultStatus
                };
            }));

            entries.AddRange(imaging.Select(o =>
            {
                TreatmentImagingOrderRowViewModel row = TreatmentImagingOrderRowViewModel.FromEntity(o);
                return new TreatmentTimelineEntryViewModel
                {
                    Id = $"imaging-{o.Id}",
                    Category = "ImagingOrder",
                    Title = row.StudyName,
                    OccurredAt = o.CreatedAt,
                    Status = row.Status
                };
            }));

            entries.AddRange(notes.Select(n => new TreatmentTimelineEntryViewModel
            {
                Id = $"note-{n.Id}",
                Category = "ProgressNote",
                Title = $"{n.NoteType} note",
                Detail = n.Content.Length <= 160 ? n.Content : n.Content[..160] + "…",
                OccurredAt = n.CreatedAt,
                ActorName = n.AuthorName
            }));

            entries.AddRange(doneTasks.Select(t => new TreatmentTimelineEntryViewModel
            {
                Id = $"task-{t.Id}",
                Category = "CompletedTask",
                Title = t.Label,
                OccurredAt = t.CompletedAt!.Value,
                ActorName = t.AssignedNurseName,
                Status = "Completed"
            }));

            return entries
                .OrderByDescending(e => e.OccurredAt)
                .Take(MaxEntries)
                .ToList();
        }

        private static (DateTime start, DateTime end)? ResolveWindow(GetTreatmentTimelineQuery request, DateTime now)
        {
            switch (request.Range?.Trim().ToLowerInvariant())
            {
                case "today":
                    return (now.Date, now);
                case "last24hours":
                    return (now.AddHours(-24), now);
                case "last7days":
                    return (now.AddDays(-7), now);
                case "custom":
                    if (!request.From.HasValue || !request.To.HasValue || request.From > request.To) return null;
                    return (request.From.Value, request.To.Value);
                default:
                    return null;
            }
        }
    }
}
