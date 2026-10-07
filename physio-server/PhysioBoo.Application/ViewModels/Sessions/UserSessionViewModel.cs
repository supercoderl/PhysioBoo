namespace PhysioBoo.Application.ViewModels.Sessions
{
    /// <summary>One signed-in device (an unexpired refresh token).</summary>
    public sealed record UserSessionViewModel(
        Guid Id,
        string Device,
        string Browser,
        string Ip,
        string Location,
        DateTime LastActiveAt,
        bool Current
    );
}
