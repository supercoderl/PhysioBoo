namespace PhysioBoo.Application.ViewModels.TreatmentSheet
{
    public sealed class TreatmentTimelineEntryViewModel
    {
        public string Id { get; set; } = string.Empty;
        // DoctorOrder | MedicationOrder | Procedure | LabOrder | ImagingOrder | NursingActivity | ProgressNote | CompletedTask
        public string Category { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Detail { get; set; }
        public DateTime OccurredAt { get; set; }
        public string? ActorName { get; set; }
        public string? Status { get; set; }
    }
}
