namespace PhysioBoo.Application.ViewModels.Radiology
{
    public sealed record RadiologyReportViewModel(
        Guid Id,
        Guid OrderId,
        string OrderNumber,
        string PatientName,
        string ClinicalIndication,
        string Technique,
        string Findings,
        string Impression,
        string Recommendations,
        bool IsCritical,
        List<string> Attachments,
        string? ReportingRadiologistName,
        string? VerifyingRadiologistName,
        string Status,
        DateTime? LastSavedAt,
        DateTime? VerifiedAt
    );

    public sealed record RadiologyReportTemplateViewModel(
        Guid Id,
        string Name,
        string ModalityName,
        bool IsFavorite,
        string ClinicalIndication,
        string Technique,
        string Findings,
        string Impression,
        string Recommendations
    );
}
