using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Application.ViewModels.MedicalRecords
{
    public sealed class PatientContextViewModel
    {
        public sealed class CareTeamMember
        {
            public Guid UserId { get; set; }
            public string FullName { get; set; } = string.Empty;
            public string Role { get; set; } = string.Empty;
            public string? Department { get; set; }
            public string? Phone { get; set; }
            public string? AvatarUrl { get; set; }
        }

        public sealed class RiskFlag
        {
            public string Label { get; set; } = string.Empty;
            public string? Note { get; set; }
            public Severity Severity { get; set; }
            public string Key { get; set; } = string.Empty;
        }

        public Guid PatientId { get; set; }
        public string Mrn { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string DateOfBirth { get; set; } = string.Empty;
        public int AgeYears { get; set; }
        public string? BloodType { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? InsuranceProvider { get; set; }
        public string? InsurancePolicyNumber { get; set; }
        public string? InsuranceExpiryDate { get; set; }
        public AdmissionStatus AdmissionStatus { get; set; }
        public string? RoomNumber { get; set; }
        public string? AdmittedAt { get; set; }
        public CareTeamMember? PrimaryDoctor { get; set; }
        public IReadOnlyList<CareTeamMember> CareTeam { get; set; } = Array.Empty<CareTeamMember>();
        public IReadOnlyList<RiskFlag> RiskFlags { get; set; } = Array.Empty<RiskFlag>();

        public static PatientContextViewModel FromEntity(Patient patient)
        {
            return new PatientContextViewModel
            {
                PatientId = patient.Id,
                Mrn = patient.PatientNumber,
                FullName = patient.User?.Profile?.FullName ?? string.Empty,
                AvatarUrl = patient.User?.ProfilePicture,
                Gender = (patient.User?.Profile?.Gender ?? Domain.Enums.Gender.Other).ToString(),
                DateOfBirth = TimeZoneHelper.ConvertDateTimeToString(patient.User?.Profile?.DateOfBirth, DateFormats.IsoDate),
                AgeYears = 0,
                BloodType = (patient.User?.Profile?.BloodGroup ?? BloodGroup.Unknown).ToString(),
                Phone = patient.User?.Phone,
                Email = patient.User?.Email,
                InsuranceProvider = patient.InssuranceProvider,
                InsurancePolicyNumber = patient.InssurancePolicyNumber,
                InsuranceExpiryDate = TimeZoneHelper.ConvertDateTimeToString(patient.InssuranceExpiryDate, DateFormats.IsoDate),
                AdmissionStatus = AdmissionStatus.Admitted,
                RoomNumber = null,
                AdmittedAt = null,
                PrimaryDoctor = new CareTeamMember
                {
                    AvatarUrl = patient.PrimaryDoctor?.User?.ProfilePicture ?? string.Empty,
                    UserId = patient.PrimaryDoctor?.User?.Id ?? Guid.NewGuid(),
                    FullName = patient.PrimaryDoctor?.User?.Profile?.FullName ?? string.Empty,
                    Role = "",
                    Department = string.Empty,
                    Phone = patient.PrimaryDoctor?.User?.Phone ?? string.Empty
                },
                CareTeam = Array.Empty<CareTeamMember>(),
                RiskFlags = Array.Empty<RiskFlag>()
            };
        }
    }
}
