using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.Core
{
    public class UserLogin : Entity
    {
        #region Core User Login Table (4)
        public string LoginProvider { get; private set; }
        public string ProviderKey { get; private set; }
        public string? ProviderDisplayName { get; private set; }
        public Guid UserId { get; private set; }

        [ForeignKey("UserId")]
        [InverseProperty("UserLogins")]
        public virtual User? User { get; private set; }
        #endregion

        #region Constructor (4)
        public UserLogin(
            Guid id,
            string loginProvider,
            string providerKey,
            string? providerDisplayName,
            Guid userId
        ) : base(id)
        {
            LoginProvider = loginProvider;
            ProviderKey = providerKey;
            ProviderDisplayName = providerDisplayName;
            UserId = userId;
        }
        #endregion

        #region Setter Methods (4)
        public void SetLoginProvider(string loginProvider) { LoginProvider = loginProvider; }
        public void SetProviderKey(string providerKey) { ProviderKey = providerKey; }
        public void SetProviderDisplayName(string? providerDisplayName) { ProviderDisplayName = providerDisplayName; }
        public void SetUser(Guid userId) { UserId = userId; }
        #endregion
    }
}
