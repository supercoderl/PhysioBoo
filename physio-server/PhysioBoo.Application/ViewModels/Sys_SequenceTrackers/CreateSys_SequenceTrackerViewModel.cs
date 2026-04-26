namespace PhysioBoo.Application.ViewModels.Sys_SequenceTrackers
{
    public sealed record CreateSys_SequenceTrackerViewModel
    (
        string EntityType,
        string Prefix,
        string? UseDateFormating,
        int SequenceLength,
        int CurrentSequence,
        string? Suffix
    );
}
