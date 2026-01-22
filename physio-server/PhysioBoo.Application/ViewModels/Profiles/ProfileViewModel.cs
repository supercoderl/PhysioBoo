using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Profiles
{
    public sealed class ProfileViewModel
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string MiddleName { get; set; } = string.Empty;
        public DateOnly DateOfBirth { get; set; }
        public Gender Gender { get; set; }
        public BloodGroup BloodGroup { get; set; }
        public MaritalStatus MaritalStatus { get; set; }
        public string? Nationality { get; set; }
        public string? IdentificationType { get; set; }
        public string? IdentificationNumber { get; set; }
        public DateTime? IdentificationExpiry { get; set; }
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }
        public string? EmergencyContactRelationship { get; set; }
        public PreferredCommunication PreferredCommunication { get; set; }

        public static ProfileViewModel FromProfile(Profile profile)
        {
            return new ProfileViewModel
            {
                Id = profile.Id,
                FirstName = profile.FirstName,
                LastName = profile.LastName,
                MiddleName = profile.MiddleName,
                DateOfBirth = profile.DateOfBirth,
                Gender = profile.Gender,
                BloodGroup = profile.BloodGroup,
                MaritalStatus = profile.MaritalStatus,
                Nationality = profile.Nationality,
                IdentificationType = profile.IdentificationType,
                IdentificationNumber = profile.IdentificationNumber,
                IdentificationExpiry = profile.IdentificationExpiry,
                EmergencyContactName = profile.EmergencyContactName,
                EmergencyContactPhone = profile.EmergencyContactPhone,
                EmergencyContactRelationship = profile.EmergencyContactRelationship,
                PreferredCommunication = profile.PreferredCommunication
            };
        }
    }
}
