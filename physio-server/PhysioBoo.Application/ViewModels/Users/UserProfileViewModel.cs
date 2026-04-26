using PhysioBoo.Application.ViewModels.Doctors;
using PhysioBoo.Application.ViewModels.Patients;
using PhysioBoo.Application.ViewModels.Profiles;
using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Application.ViewModels.Users
{
    public sealed class UserProfileViewModel
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public bool IsVerified { get; set; }
        public string? ProfilePicture { get; set; }

        public ProfileViewModel? Profile { get; set; }
        public DoctorProfileViewModel? Doctor { get; set; }
        public PatientProfileViewModel? Patient { get; set; }

        public IReadOnlyList<string> Roles { get; set; } = [];

        public static UserProfileViewModel FromUser(User user)
        {
            return new UserProfileViewModel
            {
                Id = user.Id,
                Email = user.Email,
                Phone = user.Phone,
                IsVerified = user.IsVerified,
                ProfilePicture = user.ProfilePicture,
                Profile = user.Profile != null ? ProfileViewModel.FromProfile(user.Profile) : null,
                Doctor = user.Doctor != null ? DoctorProfileViewModel.FromDoctor(user.Doctor) : null,
                Patient = user.Patient != null ? PatientProfileViewModel.FromPatient(user.Patient) : null,
                Roles = user.UserRoles.Any() ? user.UserRoles.Select(ur => ur.Role?.Code ?? string.Empty).ToList() : []
            };
        }
    }
}
