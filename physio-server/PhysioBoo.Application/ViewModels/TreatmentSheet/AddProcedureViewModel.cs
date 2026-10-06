namespace PhysioBoo.Application.ViewModels.TreatmentSheet
{
    public sealed record AddProcedureViewModel(
        string Name,
        string Status,
        string Department,
        DateTime ScheduledTime,
        DateTime? CompletionTime,
        string? PerformerName
    );
}
