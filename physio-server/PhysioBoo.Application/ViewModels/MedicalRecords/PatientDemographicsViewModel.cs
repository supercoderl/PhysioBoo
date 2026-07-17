using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.ViewModels.MedicalRecords
{
    public sealed class PatientDemographicsViewModel
    {
        public Guid PatientId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? PreferredName { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string DateOfBirth { get; set; } = string.Empty;
        public string? MaritalStatus { get; set; }
        public string? Nationality { get; set; }
        public string? PreferredLanguage { get; set; }
        public string? Occupation { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }
        public string? EmergencyContactRelationship { get; set; }

        public static PatientDemographicsViewModel FromPatient(Patient patient)
        {
            return new PatientDemographicsViewModel
            {
                PatientId = patient.Id,
                FullName = patient.User?.Profile?.FullName ?? string.Empty,
                PreferredName = patient.PreferredDoctor?.User?.Profile?.FullName ?? string.Empty,
                Gender = patient.User?.Profile?.Gender.ToString() ?? string.Empty,
                DateOfBirth = TimeZoneHelper.ConvertDateTimeToString(patient.User?.Profile?.DateOfBirth.ToDateTime(TimeOnly.MinValue) ?? DateTime.MinValue, DateFormats.Iso8601),
                MaritalStatus = patient?.User?.Profile?.MaritalStatus.ToString(),
                Nationality = patient?.User?.Profile?.Nationality,
                PreferredLanguage = patient?.User?.PreferredLanguage,
                Occupation = patient?.Occupation,
                Phone = patient?.User?.Phone,
                Email = patient?.User?.Email,
                Address = string.Empty,
                EmergencyContactName = patient?.User?.Profile?.EmergencyContactName,
                EmergencyContactPhone = patient?.User?.Profile?.EmergencyContactPhone,
                EmergencyContactRelationship = patient?.User?.Profile?.EmergencyContactRelationship
            };
        }
    }
}
