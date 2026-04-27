namespace PhysioBoo.Application.ViewModels.Users
{
    public sealed record CreateUserViewModel
    (
        string Email,
        string Phone,
        string Password
    );
}
