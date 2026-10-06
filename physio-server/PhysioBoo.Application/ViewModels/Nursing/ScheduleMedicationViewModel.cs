namespace PhysioBoo.Application.ViewModels.Nursing
{
    public sealed record ScheduleMedicationViewModel(
        string MedicationName,
        string Dose,
        string Route,
        string Frequency,
        DateTime ScheduledAt
    );
}
