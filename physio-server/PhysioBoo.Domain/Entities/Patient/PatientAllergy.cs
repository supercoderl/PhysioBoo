using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.PatientInformation
{
    public class PatientAllergy : Entity
    {
        #region Core Patient Allergy Table (11)
        public Guid PatientId { get; private set; }
        public string AllergenName { get; private set; }
        public AllergenType AllergenType { get; private set; }
        public string? ReactionType { get; private set; }
        public Severity Severity { get; private set; }
        public DateOnly? FirstOccurenceDate { get; private set; }
        public DateOnly? LastOccurenceDate { get; private set; }
        public string? TreatmentGiven { get; private set; }
        public string? Notes { get; private set; }
        public bool IsActive { get; private set; }
        public DateTime CreatedAt { get; private set; }

        [ForeignKey("PatientId")]
        [InverseProperty("Allergies")]
        public virtual Patient? Patient { get; private set; }
        #endregion

        #region Constructor (11)
        public PatientAllergy(
            Guid id,
            Guid patientId,
            string allergenName,
            AllergenType allergenType,
            string? reactionType,
            Severity severity,
            DateOnly? firstOccurenceDate,
            DateOnly? lastOccurenceDate,
            string? treatmentGiven,
            string? notes
        ) : base(id)
        {
            PatientId = patientId;
            AllergenName = allergenName;
            AllergenType = allergenType;
            ReactionType = reactionType;
            Severity = severity;
            FirstOccurenceDate = firstOccurenceDate;
            LastOccurenceDate = lastOccurenceDate;
            TreatmentGiven = treatmentGiven;
            Notes = notes;
            IsActive = true;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
        }
        #endregion

        #region Setter Methods (11)
        public void SetPatientId(Guid patientId) { PatientId = patientId; }
        public void SetAllergenName(string allergenName) { AllergenName = allergenName; }
        public void SetAllergenType(AllergenType allergenType) { AllergenType = allergenType; }
        public void SetReactionType(string? reactionType) { ReactionType = reactionType; }
        public void SetSeverity(Severity severity) { Severity = severity; }
        public void SetFirstOccurenceDate(DateOnly? firstOccurenceDate) { FirstOccurenceDate = firstOccurenceDate; }
        public void SetLastOccurenceDate(DateOnly? lastOccurenceDate) { LastOccurenceDate = lastOccurenceDate; }
        public void SetTreatmentGiven(string? treatmentGiven) { TreatmentGiven = treatmentGiven; }
        public void SetNotes(string? notes) { Notes = notes; }
        public void SetIsActive(bool isActive) { IsActive = isActive; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        #endregion
    }
}
