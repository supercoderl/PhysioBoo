namespace PhysioBoo.Application.ViewModels.InsuranceClaims
{
    public sealed record CreateInsuranceClaimViewModel(
        Guid? PatientId,
        string PatientName,
        Guid ProviderId,
        Guid? BillId,
        string PolicyNumber,
        string Diagnosis,
        string[]? Procedures,
        decimal ClaimAmount,
        string? Hospital,
        string? Department,
        string? DoctorName,
        string Priority
    );

    public sealed record InsuranceClaimFilter(
        string? Status,
        Guid? ProviderId
    );

    public sealed record SubmitInsuranceClaimViewModel(string? Notes);

    public sealed record ApproveInsuranceClaimViewModel(decimal ApprovedAmount, string? Notes);

    public sealed record RejectInsuranceClaimViewModel(string Reason);

    public sealed record AppealInsuranceClaimViewModel(string GroundsForAppeal);

    public sealed record SettleInsuranceClaimViewModel(decimal SettledAmount, DateTime? SettlementDate, string Method);

    public sealed record AddInsuranceClaimNoteViewModel(string Message);

    public sealed record AddInsuranceClaimMessageViewModel(string Message, string? Direction);
}
