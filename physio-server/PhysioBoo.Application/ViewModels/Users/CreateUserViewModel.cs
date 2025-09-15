using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Users
{
    public sealed record CreateUserViewModel
    (
        Guid Id,
        string Email,
        string Phone,
        string Password,
        Role Role = Role.Patient
    );
}
