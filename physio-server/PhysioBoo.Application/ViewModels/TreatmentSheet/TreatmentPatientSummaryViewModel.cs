namespace PhysioBoo.Application.ViewModels.TreatmentSheet
{
    public sealed class TreatmentPatientSummaryViewModel
    {
        public Guid PatientId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public string Mrn { get; set; } = string.Empty;
        public string VisitNumber { get; set; } = string.Empty;
        public string BedNumber { get; set; } = string.Empty;
        public string WardName { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public DateTime AdmissionDate { get; set; }
        public string? PrimaryDiagnosis { get; set; }
        public List<string> Allergies { get; set; } = new();
        public string? IsolationStatus { get; set; }
        public string AttendingDoctorName { get; set; } = string.Empty;
    }
}
