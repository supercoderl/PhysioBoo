using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Patients
{
    public sealed class PatientProfileViewModel
    {
        public Guid UserId { get; set; }
        public string PatientNumber { get; set; } = string.Empty;

        public PatientType PatientType { get; set; }
        public string? Occupation { get; set; }

        public bool IsVip { get; set; }
        public bool IsSeniorCitizen { get; set; }

        public Guid PrimaryDoctorId { get; set; }

        public DateTime? LastVisitDate { get; set; }
        public DateTime? NextFollowUpDate { get; set; }

        public int TotalVisits { get; set; }

        public static PatientProfileViewModel FromPatient(Patient patient)
        {
            return new PatientProfileViewModel
            {
                UserId = patient.Id,
                PatientNumber = patient.PatientNumber,
                PatientType = patient.PatientType,
                Occupation = patient.Occupation,
                IsVip = patient.IsVip,
                IsSeniorCitizen = patient.IsSeniorCitizen,
                PrimaryDoctorId = patient.PrimaryDoctorId,
                LastVisitDate = patient.LastVisitDate,
                NextFollowUpDate = patient.NextFollowUpDate,
                TotalVisits = patient.TotalVisits
            };
        }
    }
}
