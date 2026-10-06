namespace PhysioBoo.Application.ViewModels.TreatmentSheet
{
    // The ordering doctor is the signed-in user. Status defaults to Active.
    public sealed record CreateTreatmentOrderViewModel(
        string OrderType,
        string OrderName,
        string Priority,
        string? Frequency,
        DateTime StartTime,
        DateTime? EndTime,
        string? Status
    );
}
