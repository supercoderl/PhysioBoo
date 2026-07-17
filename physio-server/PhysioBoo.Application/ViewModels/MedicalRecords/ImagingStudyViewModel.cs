using PhysioBoo.Domain.Entities.LaboratoryImaging;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.ViewModels.MedicalRecords
{
    public sealed class ImagingStudyViewModel
    {
        public Guid OrderId { get; set; }
        public Guid? ReportId { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public string ModalityName { get; set; } = string.Empty;
        public string? BodyPart { get; set; }
        public string? StudyDate { get; set; }
        public ImagingOrderStatus OrderStatus { get; set; }
        public ReportStatus? ReportStatus { get; set; }
        public string? RadiologistName { get; set; }
        public string? Technique { get; set; }
        public string? Findings { get; set; }
        public string? Impression { get; set; }
        public string? Recommendations { get; set; }
        public bool IsCritical { get; set; }
        public bool IsNormal { get; set; }
        public int ImagesCount { get; set; }
        public string? DicomStudyUid { get; set; }
        public string? ReportPdfUrl { get; set; }
        public string? ImagesUrl { get; set; }

        public static ImagingStudyViewModel FromImaging(ImagingReport imagingReport)
        {
            return new ImagingStudyViewModel
            {
                OrderId = imagingReport.ImagingOrderId,
                ReportId = imagingReport.Id,
                OrderNumber = imagingReport.ImagingOrder?.OrderNumber ?? string.Empty,
                ModalityName = imagingReport.ImagingOrder?.Modality?.Name ?? string.Empty,
                BodyPart = imagingReport.ImagingOrder?.BodyPart,
                StudyDate = TimeZoneHelper.ConvertDateTimeToString(imagingReport.StudyDate, DateFormats.IsoDate),
                OrderStatus = imagingReport.ImagingOrder?.Status ?? ImagingOrderStatus.InProgress,
                ReportStatus = imagingReport.Status,
                RadiologistName = imagingReport.Radiologist?.Profile?.FullName ?? string.Empty,
                Technique = imagingReport.ImagingOrder?.Technician?.Profile?.FullName ?? string.Empty,
                Findings = imagingReport.Findings,
                Impression = imagingReport.Impression,
                Recommendations = imagingReport.Recommendations,
                IsCritical = imagingReport.IsCritical,
                IsNormal = imagingReport.IsNormal,
                ImagesCount = imagingReport.ImagesCount,
                DicomStudyUid = imagingReport.DicomStudyUid,
                ReportPdfUrl = imagingReport.ReportPdfUrl,
                ImagesUrl = imagingReport.ImagesUrl,
            };
        }
    }
}
