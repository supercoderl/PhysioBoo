namespace PhysioBoo.Application.ViewModels.Sys_SequenceTrackers
{
    /// <summary>
    /// Represents filter criteria when querying sequence trackers.
    /// </summary>
    public sealed record Sys_SequenceTrackerFilter
    (
        string Start,
        string End
    );
}
