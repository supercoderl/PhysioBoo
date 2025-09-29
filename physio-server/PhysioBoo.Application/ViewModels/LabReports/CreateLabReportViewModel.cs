namespace PhysioBoo.Application.ViewModels.LabReports
{
    public sealed record CreateLabReportViewModel
    (
        Guid Id,
        Guid LabOrderId,
        Guid PatientId,
        Guid DoctorId,
        Guid PathologistId,
        string? OverallImpression,
        string? ClinicalCorrelation,
        string? Recommendations,
        string? CriticalValues,
        string? PathologistSignature,
        string? AmendmentReason,
        Guid OriginalReportId,
        string? ReportPdfUrl,
        DateTime? DeliveredAt,
        string? DeliveryMethod
    );
}
