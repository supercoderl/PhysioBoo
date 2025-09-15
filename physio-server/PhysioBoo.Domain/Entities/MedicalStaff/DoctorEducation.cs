using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.MedicalStaff
{
    public class DoctorEducation : Entity
    {
        #region Core Doctor Education Table (19)
        public Guid DoctorId { get; private set; }
        public string DegreeType { get; private set; }
        public string DegreeName { get; private set; }
        public string? Specialization { get; private set; }
        public string InstitutionName { get; private set; }
        public string? UniversityName { get; private set; }
        public string? Location { get; private set; }
        public string? Country { get; private set; }
        public DateOnly? StartDate { get; private set; }
        public DateOnly? CompletionDate { get; private set; }
        public decimal? DurationYears { get; private set; }
        public decimal? GradePercentage { get; private set; }
        public decimal? GradeGPA { get; private set; }
        public string? GradeClass { get; private set; }
        public string? ThesisTitle { get; private set; }
        public string? ThesisGuide { get; private set; }
        public bool IsVerified { get; private set; }
        public string? VerificationDocumentUrl { get; private set; }
        public DateTime CreatedAt { get; private set; }

        [ForeignKey("DoctorId")]
        [InverseProperty("Educations")]
        public virtual Doctor? Doctor { get; private set; }
        #endregion

        #region Constructor (19)
        public DoctorEducation(
            Guid id,
            Guid doctorId,
            string degreeType,
            string degreeName,
            string? specialization,
            string institutionName,
            string? universityName,
            string? location,
            string? country,
            DateOnly? startDate,
            DateOnly? completionDate,
            decimal? durationYears,
            decimal? gradePercentage,
            decimal? gradeGPA,
            string? gradeClass,
            string? thesisTitle,
            string? thesisGuide,
            string? verificationDocumentUrl
        ) : base(id)
        {
            DoctorId = doctorId;
            DegreeType = degreeType;
            DegreeName = degreeName;
            Specialization = specialization;
            InstitutionName = institutionName;
            UniversityName = universityName;
            Location = location;
            Country = country;
            StartDate = startDate;
            CompletionDate = completionDate;
            DurationYears = durationYears;
            GradePercentage = gradePercentage;
            GradeGPA = gradeGPA;
            GradeClass = gradeClass;
            ThesisTitle = thesisTitle;
            ThesisGuide = thesisGuide;
            IsVerified = false;
            VerificationDocumentUrl = verificationDocumentUrl;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
        }
        #endregion

        #region Setter Methods (19)
        public void SetDoctorId(Guid doctorId) { DoctorId = doctorId; }
        public void SetDegreeType(string degreeType) { DegreeType = degreeType; }
        public void SetDegreeName(string degreeName) { DegreeName = degreeName; }
        public void SetSpecialization(string? specialization) { Specialization = specialization; }
        public void SetInstitutionName(string institutionName) { InstitutionName = institutionName; }
        public void SetUniversityName(string? universityName) { UniversityName = universityName; }
        public void SetLocation(string? location) { Location = location; }
        public void SetCountry(string? country) { Country = country; }
        public void SetStartDate(DateOnly? startDate) { StartDate = startDate; }
        public void SetCompletionDate(DateOnly? completionDate) { CompletionDate = completionDate; }
        public void SetDurationYears(decimal? durationYears) { DurationYears = durationYears; }
        public void SetGradePercentage(decimal? gradePercentage) { GradePercentage = gradePercentage; }
        public void SetGradeGPA(decimal? gradeGPA) { GradeGPA = gradeGPA; }
        public void SetGradeClass(string? gradeClass) { GradeClass = gradeClass; }
        public void SetThesisTitle(string? thesisTitle) { ThesisTitle = thesisTitle; }
        public void SetThesisGuide(string? thesisGuide) { ThesisGuide = thesisGuide; }
        public void SetIsVerified(bool isVerified) { IsVerified = isVerified; }
        public void SetVerificationDocumentUrl(string? verificationDocumentUrl) { VerificationDocumentUrl = verificationDocumentUrl; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        #endregion
    }
}
