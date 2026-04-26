using PhysioBoo.Domain.Entities.MedicalStaff;

namespace PhysioBoo.Application.ViewModels.Doctors
{
    public sealed class DoctorProfileViewModel
    {
        public Guid UserId { get; set; }
        public string? Bio { get; set; }
        public string? About { get; set; }

        public string[] LanguagesSpoken { get; set; } = [];
        public int YearsOfExperience { get; set; }

        public decimal ConsultationFeeMin { get; set; }
        public decimal ConsultationFeeMax { get; set; }

        public decimal AverageRating { get; set; }
        public int TotalReviews { get; set; }

        public static DoctorProfileViewModel FromDoctor(Doctor doctor)
        {
            return new DoctorProfileViewModel
            {
                UserId = doctor.Id,
                Bio = doctor.Bio,
                About = doctor.About,
                LanguagesSpoken = doctor.LanguagesSpoken,
                YearsOfExperience = doctor.YearsOfExperience,
                ConsultationFeeMin = doctor.ConsultationFeeMin,
                ConsultationFeeMax = doctor.ConsultationFeeMax,
                AverageRating = doctor.AverageRating,
                TotalReviews = doctor.TotalReviews
            };
        }
    }
}
