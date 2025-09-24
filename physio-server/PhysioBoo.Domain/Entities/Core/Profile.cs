using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Domain.Entities.Core
{
    public class Profile : Entity
    {
        #region Core Profile Table (17)
        public string FirstName { get; private set; }
        public string LastName { get; private set; }
        public string MiddleName { get; private set; }
        public DateOnly DateOfBirth { get; private set; }
        public Gender Gender { get; private set; }
        public BloodGroup BloodGroup { get; private set; }
        public MaritalStatus MaritalStatus { get; private set; }
        public string? Nationality { get; private set; }
        public string? IdentificationType { get; private set; }
        public string? IdentificationNumber { get; private set; }
        public DateTime? IdentificationExpiry { get; private set; }
        public string? EmergencyContactName { get; private set; }
        public string? EmergencyContactPhone { get; private set; }
        public string? EmergencyContactRelationship { get; private set; }
        public PreferredCommunication PreferredCommunication { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }

        public virtual User? User { get; private set; }
        #endregion

        #region Constructor (17)
        public Profile(
            Guid id,
            string firstName,
            string lastName,
            string middleName,
            DateOnly dateOfBirth,
            Gender gender,
            BloodGroup bloodGroup,
            MaritalStatus maritalStatus,
            string? nationality,
            string? identificationType,
            string? identificationNumber,
            DateTime? identificationExpiry,
            string? emergencyContactName,
            string? emergencyContactPhone,
            string? emergencyContactRelationship,
            PreferredCommunication preferredCommunication
        ) : base(id)
        {
            FirstName = firstName;
            LastName = lastName;
            MiddleName = middleName;
            DateOfBirth = dateOfBirth;
            Gender = gender;
            BloodGroup = bloodGroup;
            MaritalStatus = maritalStatus;
            Nationality = nationality;
            IdentificationType = identificationType;
            IdentificationNumber = identificationNumber;
            IdentificationExpiry = identificationExpiry;
            EmergencyContactName = emergencyContactName;
            EmergencyContactPhone = emergencyContactPhone;
            EmergencyContactRelationship = emergencyContactRelationship;
            PreferredCommunication = preferredCommunication;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
            UpdatedAt = null;
        }
        #endregion

        #region Setter Methods (17)
        public void SetFirstName(string firstName) { FirstName = firstName; }
        public void SetLastName(string lastName) { LastName = lastName; }
        public void SetMiddleName(string middleName) { MiddleName = middleName; }
        public void SetDateOfBirth(DateOnly dateOfBirth) { DateOfBirth = dateOfBirth; }
        public void SetGender(Gender gender) { Gender = gender; }
        public void SetBloodGroup(BloodGroup bloodGroup) { BloodGroup = bloodGroup; }
        public void SetMaritalStatus(MaritalStatus maritalStatus) { MaritalStatus = maritalStatus; }
        public void SetNationality(string? nationality) { Nationality = nationality; }
        public void SetIdentificationType(string? identificationType) { IdentificationType = identificationType; }
        public void SetIdentificationNumber(string? identificationNumber) { IdentificationNumber = identificationNumber; }
        public void SetIdentificationExpiry(DateTime? identificationExpiry) { IdentificationExpiry = identificationExpiry; }
        public void SetEmergencyContactName(string? emergencyContactName) { EmergencyContactName = emergencyContactName; }
        public void SetEmergencyContactPhone(string? emergencyContactPhone) { EmergencyContactPhone = emergencyContactPhone; }
        public void SetEmergencyContactRelationship(string? emergencyContactRelationship) { EmergencyContactRelationship = emergencyContactRelationship; }
        public void SetPreferredCommunication(PreferredCommunication preferredCommunication) { PreferredCommunication = preferredCommunication; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        public void SetUpdatedAt(DateTime? updatedAt) { UpdatedAt = updatedAt; }
        #endregion
    }
}
