namespace PhysioBoo.Application.ViewModels.Laboratory
{
    public sealed record LabResultEntryViewModel(
        Guid Id,
        Guid OrderId,
        string OrderNumber,
        string PatientName,
        string Mrn,
        string TestName,
        string Value,
        string? Unit,
        string? ReferenceRange,
        string Flag,
        string? Comments,
        List<string> Attachments,
        string? VerifyingTechnicianName,
        string? VerifyingPathologistName,
        string VerificationStatus,
        DateTime? VerifiedAt
    );
}
