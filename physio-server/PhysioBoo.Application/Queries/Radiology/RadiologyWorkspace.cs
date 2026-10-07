using PhysioBoo.Application.Queries.Laboratory;
using PhysioBoo.Application.ViewModels.Radiology;
using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.Queries.Radiology
{
    /// <summary>
    /// Shared mapping for the radiology workspace. One ImagingOrder is one examination; it is also
    /// the schedule slot, the queue entry and (once imaging starts) the study, so they share its id.
    /// The latest ImagingReport of the order is its report.
    /// </summary>
    public static class RadiologyWorkspace
    {
        // No lazy loading: every name shown in the workspace must be included here (gotcha 3).
        public const string OrderIncludes =
            "Patient.Profile," +
            "Doctor.User.Profile," +
            "Doctor.Department," +
            "Appointment.Department," +
            "Modality," +
            "Technician.Profile," +
            "Radiologist.Profile," +
            "ImagingReports.Radiologist.Profile," +
            "ImagingReports.Verifier.Profile";

        public const int DefaultPageSize = 500;

        #region Names
        public static string PatientName(ImagingOrder? order) => order?.Patient?.Profile?.FullName ?? "Unknown patient";

        public static string Mrn(ImagingOrder order) => order.Patient?.PatientNumber ?? string.Empty;

        public static string ModalityName(ImagingOrder order) => order.Modality?.Name ?? "Imaging";

        public static string ExaminationName(ImagingOrder order) => $"{ModalityName(order)} {order.BodyPart}".Trim();

        public static string RoomName(ImagingOrder order) => order.RoomName ?? $"{ModalityName(order)} Room 1";

        public static string? TechnicianName(ImagingOrder order) => order.TechnicianName ?? order.Technician?.Profile?.FullName;

        public static string? RadiologistName(ImagingOrder order, ImagingReport? report) =>
            report?.Radiologist?.Profile?.FullName ?? order.Radiologist?.Profile?.FullName;

        public static DateTime? ScheduledAt(ImagingOrder order) =>
            order.ScheduledDate?.ToDateTime(order.ScheduledTime ?? TimeOnly.MinValue);
        #endregion

        #region Statuses
        public static ImagingReport? LatestReport(ImagingOrder order) =>
            order.ImagingReports.OrderByDescending(r => r.CreatedAt).FirstOrDefault();

        /// <summary>Order status in workspace terms (older Completed/ReportPending map onto the new stages).</summary>
        public static string Status(ImagingOrder order) => order.Status switch
        {
            ImagingOrderStatus.Completed => nameof(ImagingOrderStatus.ImagingCompleted),
            ImagingOrderStatus.ReportPending => nameof(ImagingOrderStatus.ImageUploaded),
            _ => order.Status.ToString()
        };

        /// <summary>No report yet: NotStarted until imaging is done, then Reporting (ready to dictate).</summary>
        public static string ReportStatus(ImagingOrder order, ImagingReport? report)
        {
            if (report != null) return report.WorkflowStatus.ToString();
            return order.IsImagingDone ? nameof(RadiologyReportStatus.Reporting) : "NotStarted";
        }

        public static string QueueStatus(ImagingOrder order) => (order.QueueStatus ?? RadiologyQueueStatus.Waiting).ToString();
        #endregion

        #region Row builders
        public static ImagingOrderRowViewModel ToOrderRow(ImagingOrder order, IReadOnlyDictionary<Guid, string> wards)
        {
            ImagingReport? report = LatestReport(order);

            return new ImagingOrderRowViewModel(
                order.Id,
                order.OrderNumber,
                PatientName(order),
                Mrn(order),
                order.Appointment?.AppointmentNumber ?? string.Empty,
                order.Appointment?.Department?.Name ?? order.Doctor?.Department?.Name ?? string.Empty,
                wards.TryGetValue(order.PatientId, out string? ward) ? ward : string.Empty,
                new List<ImagingExaminationViewModel>
                {
                    new(order.Id, ExaminationName(order), ModalityName(order), order.BodyPart ?? string.Empty)
                },
                order.Doctor?.User?.Profile?.FullName ?? string.Empty,
                LabWorkspace.Priority(order.LabPriority),
                ScheduledAt(order),
                Status(order),
                ReportStatus(order, report),
                RadiologistName(order, report),
                TechnicianName(order),
                order.CreatedAt
            );
        }

        public static ScheduleSlotViewModel ToSlot(ImagingOrder order)
        {
            return new ScheduleSlotViewModel(
                order.Id,
                order.Id,
                order.OrderNumber,
                PatientName(order),
                ExaminationName(order),
                ModalityName(order),
                RoomName(order),
                TechnicianName(order),
                ScheduledAt(order) ?? order.CreatedAt,
                order.EstimatedDuration > 0 ? order.EstimatedDuration : Math.Max(15, order.Modality?.AverageDurationMinutes ?? 30),
                order.Modality?.PreparationRequired == true ? order.Modality.PreparationInstructions : null,
                Status(order)
            );
        }

        public static QueueEntryViewModel ToQueueEntry(ImagingOrder order)
        {
            return new QueueEntryViewModel(
                order.Id,
                order.Id,
                order.OrderNumber,
                PatientName(order),
                ExaminationName(order),
                ModalityName(order),
                LabWorkspace.Priority(order.LabPriority),
                RoomName(order),
                QueueStatus(order),
                order.QueueCalledAt
            );
        }

        public static StudyRecordViewModel ToStudy(ImagingOrder order, IEnumerable<Guid> comparisonStudyIds)
        {
            ImagingReport? report = LatestReport(order);
            bool verified = report?.WorkflowStatus is RadiologyReportStatus.Verified or RadiologyReportStatus.Released;
            bool uploaded = order.Status is ImagingOrderStatus.ImageUploaded or ImagingOrderStatus.ReportPending || (report?.ImagesCount ?? 0) > 0;

            return new StudyRecordViewModel(
                order.Id,
                order.Id,
                order.OrderNumber,
                PatientName(order),
                Mrn(order),
                ExaminationName(order),
                ModalityName(order),
                order.BodyPart ?? string.Empty,
                report?.Technique,
                order.ImagingCompletedAt ?? order.ImagingStartedAt,
                report?.ImagesCount ?? 0,
                report?.DicomStudyUid,
                report?.IsCritical ?? false,
                new List<StudyTimelineEventViewModel>
                {
                    new("Ordered", order.CreatedAt),
                    new("Scheduled", order.ScheduledDate != null ? ScheduledAt(order) : null),
                    new("Arrived", order.ArrivedAt),
                    new("ImagingStarted", order.ImagingStartedAt),
                    new("ImagingCompleted", order.ImagingCompletedAt),
                    new("ImageUploaded", uploaded ? order.ImagingCompletedAt : null),
                    new("Reporting", report?.DictatedAt),
                    new("Verified", verified ? report!.VerifiedAt : null),
                    new("Released", verified ? report!.ReleasedAt : null),
                },
                comparisonStudyIds.ToList()
            );
        }

        public static RadiologyReportViewModel ToReport(ImagingOrder order, ImagingReport? report)
        {
            return new RadiologyReportViewModel(
                report?.Id ?? Guid.Empty,
                order.Id,
                order.OrderNumber,
                PatientName(order),
                report?.ClinicalIndication ?? order.ClinicalIndication ?? string.Empty,
                report?.Technique ?? string.Empty,
                report?.Findings ?? string.Empty,
                report?.Impression ?? string.Empty,
                report?.Recommendations ?? string.Empty,
                report?.IsCritical ?? false,
                new List<string>(),
                report?.Radiologist?.Profile?.FullName,
                report?.Verifier?.Profile?.FullName,
                ReportStatus(order, report),
                report?.LastSavedAt,
                report?.VerifiedAt
            );
        }
        #endregion
    }
}
