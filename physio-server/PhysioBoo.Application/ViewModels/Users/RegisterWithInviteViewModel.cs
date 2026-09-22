namespace PhysioBoo.Application.ViewModels.Users
{
    public sealed record RegisterWithInviteViewModel(
        string Token,
        string Email,
        string Phone,
        string Password
    );
}
