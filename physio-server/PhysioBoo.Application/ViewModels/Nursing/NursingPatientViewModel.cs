namespace PhysioBoo.Application.ViewModels.Nursing
{
    public sealed class NursingRiskFlagsViewModel
    {
        public bool FallRisk { get; set; }
        public bool IsolationRequired { get; set; }
        public string? IsolationType { get; set; }
        public bool IsEmergency { get; set; }
        public bool HasAllergies { get; set; }
    }

    public sealed class NursingPatientViewModel
    {
        public Guid Id { get; set; }                  // assignment id (admission id when there is no assignment)
        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string PatientNumber { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public Guid WardId { get; set; }
        public string WardName { get; set; } = string.Empty;
        public string BedNumber { get; set; } = string.Empty;
        public int Age { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string? PrimaryDoctorName { get; set; }
        public string Acuity { get; set; } = string.Empty;
        public NursingRiskFlagsViewModel Risk { get; set; } = new();
        public string? NextTaskLabel { get; set; }
        public DateTime? NextTaskDueAt { get; set; }
        public int MarDueCount { get; set; }
        public DateTime? LastVitalsAt { get; set; }
    }
}
