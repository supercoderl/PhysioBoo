namespace PhysioBoo.Application.ViewModels.Nursing
{
    public sealed record CreateNursingTaskViewModel(
        string Label,
        DateTime DueAt,
        string? AssignedNurseName
    );
}
