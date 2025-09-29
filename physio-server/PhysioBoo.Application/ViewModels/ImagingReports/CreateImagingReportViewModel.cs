namespace PhysioBoo.Application.ViewModels.ImagingReports
{
    public sealed record CreateImagingReportViewModel
    (
        Guid Id,
        Guid ImagingOrderId,
        Guid PatientId,
        Guid? RadiologistId,
        string? Technique,
        string? Findings,
        string? Impression,
        string? Recommendations,
        string? ComparisonStudies,
        string? Limitations,
        string? CriticalFindings,
        string? AmendmentReason,
        DateTime? DictatedAt,
        DateTime? TranscribedAt,
        DateTime? VerifiedAt,
        string? DicomStudyUid,
        string? ReportPdfUrl,
        string? ImagesUrl
    );
}
