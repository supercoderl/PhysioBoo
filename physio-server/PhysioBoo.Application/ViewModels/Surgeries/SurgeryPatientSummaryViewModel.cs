namespace PhysioBoo.Application.ViewModels.Surgeries
{
    public sealed class SurgeryPatientSummaryViewModel
    {
        public Guid PatientId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Mrn { get; set; } = string.Empty;
        public string Diagnosis { get; set; } = string.Empty;
        public List<string> Allergies { get; set; } = new();
        public string ConsentStatus { get; set; } = string.Empty;
        public string RiskAssessment { get; set; } = string.Empty;
    }
}
