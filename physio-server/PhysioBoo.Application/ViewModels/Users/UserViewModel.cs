using PhysioBoo.Application.ViewModels.Doctors;
using PhysioBoo.Application.ViewModels.Patients;
using PhysioBoo.Application.ViewModels.Profiles;
using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Application.ViewModels.Users
{
    public sealed record UserRoleSummaryViewModel(Guid Id, string Name, string Code);

    public sealed class UserViewModel
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? AlternatePhone { get; set; }
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

        public DoctorViewModel? Doctor { get; set; }
        public PatientViewModel? Patient { get; set; }
        public ProfileViewModel? Profile { get; set; }

        // Filled only when the query loads UserRoles.Role (user search does).
        public List<UserRoleSummaryViewModel> Roles { get; set; } = new();

        public static UserViewModel FromUser(User user)
        {
            return new UserViewModel
            {
                Id = user.Id,
                Email = user.Email,
                Phone = user.Phone,
                AlternatePhone = user.AlternatePhone,
                IsActive = user.IsActive,
                IsVerified = user.IsVerified,
                EmailVerifiedAt = user.EmailVerifiedAt,
                PhoneVerifiedAt = user.PhoneVerifiedAt,
                LastLoginAt = user.LastLoginAt,
                FailedLoginAttempts = user.FailedLoginAttempts,
                AccountLockedUntil = user.AccountLockedUntil,
                TwoFactorEnabled = user.TwoFactorEnabled,
                // Never sent to clients: anyone who can list users would otherwise read their 2FA secrets.
                TwoFactorSecret = null,
                ProfilePicture = user.ProfilePicture,
                PreferredLanguage = user.PreferredLanguage,
                TimeZone = user.TimeZone,
                CreatedAt = user.CreatedAt,
                CreatedBy = user.CreatedBy,
                UpdatedAt = user.UpdatedAt,
                UpdatedBy = user.UpdatedBy,
                Doctor = user.Doctor != null ? DoctorViewModel.FromDoctor(user.Doctor) : null,
                Patient = user.Patient != null ? PatientViewModel.FromPatient(user.Patient) : null,
                Profile = user.Profile != null ? ProfileViewModel.FromProfile(user.Profile) : null,
                Roles = user.UserRoles
                    .Where(ur => ur.Role != null)
                    .Select(ur => new UserRoleSummaryViewModel(ur.RoleId, ur.Role!.Name, ur.Role.Code))
                    .ToList()
            };
        }
    }
}
