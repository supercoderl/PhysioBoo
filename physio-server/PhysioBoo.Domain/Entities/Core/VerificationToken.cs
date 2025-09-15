using PhysioBoo.Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.Core
{
    public class VerificationToken : Entity
    {
        public Guid UserId { get; private set; }
        public string Token { get; private set; }
        public DateTime ExpiresAt { get; private set; }
        public bool IsUsed { get; private set; }
        public VerificationType Type { get; private set; }

        [InverseProperty("VerificationTokens")]
        [ForeignKey("UserId")]
        public virtual User? User { get; private set; }

        public VerificationToken(
            Guid id,
            Guid userId,
            string token,
            DateTime expiresAt,
            VerificationType type
        ) : base(id)
        {
            UserId = userId;
            Token = token;
            ExpiresAt = expiresAt;
            Type = type;
        }

        public void SetUserId(Guid userId) { UserId = userId; }
        public void SetToken(string token) { Token = token; }
        public void SetExpiresAt(DateTime expiresAt) { ExpiresAt = expiresAt; }
        public void SetVerificationType(VerificationType type) { Type = type; }
    }
}
