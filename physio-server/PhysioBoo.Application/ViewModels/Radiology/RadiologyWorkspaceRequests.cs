namespace PhysioBoo.Application.ViewModels.Radiology
{
    public sealed record RescheduleSlotViewModel(DateTime? ScheduledTime, string? RoomName);

    public sealed record ReassignTechnicianViewModel(string? TechnicianName);

    public sealed record AdvanceQueueViewModel(string? Status);

    public sealed record RadiologyReasonViewModel(string? Reason);

    public sealed record SaveRadiologyReportViewModel(
        string? ClinicalIndication,
        string? Technique,
        string? Findings,
        string? Impression,
        string? Recommendations,
        bool? IsCritical
    );
}

namespace PhysioBoo.Application.ViewModels.Radiology
{
    /// <summary>A clinician ordering an imaging exam. Visit, doctor and hospital are taken from the patient's latest visit.</summary>
    public sealed record PlaceImagingOrderViewModel(Guid PatientId, Guid ModalityId, string? BodyPart, string? ClinicalIndication, string? Priority, bool ContrastRequired);
}
