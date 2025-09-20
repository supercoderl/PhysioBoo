using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.VerificationTokens
{
    public sealed class VerificationTokenViewModel
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Token { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public bool IsUsed { get; set; }
        public VerificationType Type { get; set; }
        public string UserEmail { get; set; } = string.Empty;
        public Role UserRole { get; set; }

        public static VerificationTokenViewModel FromVerificationToken(VerificationToken verificationToken)
        {
            return new VerificationTokenViewModel
            {
                Id = verificationToken.Id,
                UserId = verificationToken.UserId,
                Token = verificationToken.Token,
                ExpiresAt = verificationToken.ExpiresAt,
                Type = verificationToken.Type,
                IsUsed = verificationToken.IsUsed,
                UserEmail = verificationToken.User?.Email ?? string.Empty,
                UserRole = verificationToken.User?.Role ?? Role.Patient
            };
        }
    }
}
