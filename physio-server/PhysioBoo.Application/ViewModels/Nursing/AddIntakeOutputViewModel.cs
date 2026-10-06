namespace PhysioBoo.Application.ViewModels.Nursing
{
    public sealed record AddIntakeOutputViewModel(
        DateTime? RecordedAt,
        string Direction,
        string Category,
        int VolumeMl,
        string? Notes
    );
}
