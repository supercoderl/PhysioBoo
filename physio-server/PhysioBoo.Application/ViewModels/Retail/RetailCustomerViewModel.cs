namespace PhysioBoo.Application.ViewModels.Retail
{
    public sealed class RetailCustomerViewModel
    {
        public string Type { get; set; } = "WalkIn"; // Patient | WalkIn
        public Guid? PatientId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? Mrn { get; set; }
        public string? InsuranceProvider { get; set; }
        public decimal? InsuranceCoverageAmount { get; set; }
        public int? LoyaltyPoints { get; set; }
        public string? PrescriptionReference { get; set; }
        public string? AllergyInformation { get; set; }
    }
}
