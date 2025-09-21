using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.Core
{
    public class RefreshToken : Entity
    {
        #region Core Refresh Token Table (4)
        public Guid UserId { get; private set; }
        public string Token { get; private set; }
        public DateTime ExpiresAt { get; private set; }
        public DateTime CreatedAt { get; private set; }

        [InverseProperty("RefreshTokens")]
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
        #endregion

        #region Constructor (4)
        public RefreshToken(
            Guid id,
            Guid userId,
            string token,
            DateTime expiresAt
        ) : base(id)
        {
            UserId = userId;
            Token = token;
            ExpiresAt = expiresAt;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
        }
        #endregion

        #region Setter Methods (4)
        public void SetUserId(Guid userId) { UserId = userId; }
        public void SetToken(string token) { Token = token; }
        public void Revoke() { ExpiresAt = TimeZoneHelper.GetLocalTimeNow(); }
        public void SetCreatedAt(DateTime createdAt) { ExpiresAt = createdAt; }
        public void SetUser(User? user) { User = user; }
        #endregion
    }
}
