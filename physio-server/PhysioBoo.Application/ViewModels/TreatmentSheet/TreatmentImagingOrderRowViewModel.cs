using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.TreatmentSheet
{
    // Read-only view of the radiology module's imaging orders.
    public sealed class TreatmentImagingOrderRowViewModel
    {
        public Guid Id { get; set; }
        public string StudyName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;      // Ordered | Scheduled | InProgress | Completed | Cancelled
        public bool ReportAvailable { get; set; }
        public bool ImagesAvailable { get; set; }
        public DateTime? ScheduledTime { get; set; }

        public static TreatmentImagingOrderRowViewModel FromEntity(ImagingOrder entity)
        {
            bool done = entity.Status is ImagingOrderStatus.Completed or ImagingOrderStatus.ReportPending;

            return new TreatmentImagingOrderRowViewModel
            {
                Id = entity.Id,
                StudyName = string.IsNullOrWhiteSpace(entity.BodyPart)
                    ? entity.Modality?.Name ?? "Imaging study"
                    : $"{entity.Modality?.Name} - {entity.BodyPart}".Trim(' ', '-'),
                // "ReportPending" means the study is done and the report is not: the sheet shows it as Completed.
                Status = entity.Status == ImagingOrderStatus.ReportPending ? "Completed" : entity.Status.ToString(),
                ReportAvailable = entity.ImagingReports.Count > 0,
                ImagesAvailable = done,
                ScheduledTime = entity.ScheduledDate.HasValue
                    ? entity.ScheduledDate.Value.ToDateTime(entity.ScheduledTime ?? TimeOnly.MinValue)
                    : null
            };
        }
    }
}
