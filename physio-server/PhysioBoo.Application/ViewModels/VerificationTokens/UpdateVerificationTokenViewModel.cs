using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.VerificationTokens
{
    public sealed record UpdateVerificationTokenViewModel
    (
        Guid? Id = null,
        Guid? UserId = null,
        string? Token = null,
        DateTime? ExpiresAt = null,
        VerificationType? Type = null,
        bool? IsUsed = null
    );
}
