using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Users
{
    public sealed record VerificationTokenViewModel
    (
        Guid Id,
        Guid UserId,
        string Token,
        DateTime ExpiresAt,
        VerificationType Type
    );
}
