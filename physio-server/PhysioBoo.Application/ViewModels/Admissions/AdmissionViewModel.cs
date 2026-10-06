using PhysioBoo.Domain.Entities.Inpatient;

namespace PhysioBoo.Application.ViewModels.Admissions
{
    public sealed class AdmissionViewModel
    {
        public Guid Id { get; set; }
        public string AdmissionNumber { get; set; } = string.Empty;
        public Guid PatientId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string PatientNumber { get; set; } = string.Empty;
        public string AdmissionType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime AdmittedAt { get; set; }
        public Guid DepartmentId { get; set; }
        public string? DepartmentName { get; set; }
        public Guid DoctorId { get; set; }
        public string? DoctorName { get; set; }
        public string? ReferredBy { get; set; }
        public string ChiefComplaint { get; set; } = string.Empty;
        public string ProvisionalDiagnosis { get; set; } = string.Empty;
        public string? Allergies { get; set; }
        public string? CurrentMedications { get; set; }
        public string? MedicalHistory { get; set; }
        public bool HasInsurance { get; set; }
        public string? InsuranceProvider { get; set; }
        public string? PolicyNumber { get; set; }
        public Guid? BedId { get; set; }
        public string? BedNumber { get; set; }
        public string? WardName { get; set; }
        public DateTime? DischargedAt { get; set; }
        public string? DischargeNotes { get; set; }

        // openStay is the admission's current bed assignment (Bed -> Ward loaded), or null.
        public static AdmissionViewModel FromEntity(Admission entity, BedAssignment? openStay)
        {
            return new AdmissionViewModel
            {
                Id = entity.Id,
                AdmissionNumber = entity.AdmissionNumber,
                PatientId = entity.PatientId,
                PatientName = entity.Patient?.Profile?.FullName ?? string.Empty,
                PatientNumber = entity.Patient?.PatientNumber ?? string.Empty,
                AdmissionType = entity.AdmissionType.ToString(),
                Status = entity.Status.ToString(),
                AdmittedAt = entity.AdmittedAt,
                DepartmentId = entity.DepartmentId,
                DepartmentName = entity.Department?.Name,
                DoctorId = entity.DoctorId,
                DoctorName = entity.Doctor?.User?.Profile?.FullName,
                ReferredBy = entity.ReferredBy,
                ChiefComplaint = entity.ChiefComplaint,
                ProvisionalDiagnosis = entity.ProvisionalDiagnosis,
                Allergies = entity.Allergies,
                CurrentMedications = entity.CurrentMedications,
                MedicalHistory = entity.MedicalHistory,
                HasInsurance = entity.HasInsurance,
                InsuranceProvider = entity.InsuranceProvider,
                PolicyNumber = entity.PolicyNumber,
                BedId = openStay?.BedId,
                BedNumber = openStay?.Bed?.Number,
                WardName = openStay?.Bed?.Ward?.Name,
                DischargedAt = entity.DischargedAt,
                DischargeNotes = entity.DischargeNotes
            };
        }
    }
}
