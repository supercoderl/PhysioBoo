namespace PhysioBoo.Application.ViewModels.Users
{
    public sealed record ChangePasswordViewModel
    (
        string OldPassword,
        string NewPassword
    );
}
