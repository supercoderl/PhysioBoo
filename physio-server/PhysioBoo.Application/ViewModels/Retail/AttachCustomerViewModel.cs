namespace PhysioBoo.Application.ViewModels.Retail
{
    public sealed record AttachCustomerViewModel(
        string Type, // Patient | WalkIn
        Guid? PatientId,
        string FullName,
        string Phone,
        string? Mrn,
        string? InsuranceProvider,
        decimal? InsuranceCoverageAmount,
        int? LoyaltyPoints,
        string? PrescriptionReference,
        string? AllergyInformation
    );
}
