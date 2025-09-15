using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Users
{
    public sealed class UserViewModel
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? AlternatePhone { get; set; }
        public Role Role { get; set; }
        public bool IsActive { get; set; }
        public bool IsVerified { get; set; }
        public DateTime? EmailVerifiedAt { get; set; }
        public DateTime? PhoneVerifiedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public int FailedLoginAttempts { get; set; }
        public DateTime? AccountLockedUntil { get; set; }
        public bool TwoFactorEnabled { get; set; }
        public string? TwoFactorSecret { get; set; }
        public string? ProfilePicture { get; set; }
        public string PreferredLanguage { get; set; } = string.Empty;
        public string TimeZone { get; set; } = string.Empty;
        public DateTime CreatedAt { get; private set; }
        public Guid? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public Guid? UpdatedBy { get; set; }

        public static UserViewModel FromUser(User user)
        {
            return new UserViewModel
            {
                Id = user.Id,
                Email = user.Email,
                Phone = user.Phone,
                AlternatePhone = user.AlternatePhone,
                Role = user.Role,
                IsActive = user.IsActive,
                IsVerified = user.IsVerified,
                EmailVerifiedAt = user.EmailVerifiedAt,
                PhoneVerifiedAt = user.PhoneVerifiedAt,
                LastLoginAt = user.LastLoginAt,
                FailedLoginAttempts = user.FailedLoginAttempts,
                AccountLockedUntil = user.AccountLockedUntil,
                TwoFactorEnabled = user.TwoFactorEnabled,
                TwoFactorSecret = user.TwoFactorSecret,
                ProfilePicture = user.ProfilePicture,
                PreferredLanguage = user.PreferredLanguage,
                TimeZone = user.TimeZone,
                CreatedAt = user.CreatedAt,
                CreatedBy = user.CreatedBy,
                UpdatedAt = user.UpdatedAt,
                UpdatedBy = user.UpdatedBy
            };
        }
    }
}
