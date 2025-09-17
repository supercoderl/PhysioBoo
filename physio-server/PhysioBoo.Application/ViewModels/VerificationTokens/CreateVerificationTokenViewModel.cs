using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.VerificationTokens
{
    public sealed record CreateVerificationTokenViewModel
    (
        Guid Id,
        Guid UserId,
        string Token,
        DateTime ExpiresAt,
        VerificationType Type
    );
}
