namespace PhysioBoo.Application.ViewModels.Appointments
{
    public sealed record CompleteConsultationViewModel(
        string Diagnosis,
        string? TreatmentPlan,
        string? FollowUpDate,
        string? DoctorNotes,
        int? ActualDurationMinutes
    );
}
