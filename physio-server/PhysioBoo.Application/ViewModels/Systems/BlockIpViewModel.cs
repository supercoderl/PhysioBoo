namespace PhysioBoo.Application.ViewModels.Systems
{
    public sealed record BlockIpViewModel
    (
        string IpAddress,
        string Reason,
        int DurationMinutes
    );
}
