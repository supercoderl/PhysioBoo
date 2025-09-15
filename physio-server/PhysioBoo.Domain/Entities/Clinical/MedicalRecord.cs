using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.Clinical
{
    public class MedicalRecord : Entity
    {
        #region Core Medical Record Table (34)
        public string RecordNumber { get; private set; }
        public Guid PatientId { get; private set; }
        public Guid AppointmentId { get; private set; }
        public Guid DoctorId { get; private set; }
        public Guid HospitalId { get; private set; }
        public DateOnly RecordDate { get; private set; }
        public RecordType RecordType { get; private set; }
        public string? ChiefComplaint { get; private set; }
        public string? HistoryOfPresentIllness { get; private set; }
        public string? PastMedicalHistory { get; private set; }
        public string? FamilyHistory { get; private set; }
        public string? SocialHistory { get; private set; }
        public string? ReviewOfSystems { get; private set; }
        public string? PhysicalExamination { get; private set; }
        public string? VitalSigns { get; private set; }
        public string? ClinicalFindings { get; private set; }
        public string? ProvisionalDiagnosis { get; private set; }
        public string? FinalDiagnosis { get; private set; }
        public string[] Icd10Codes { get; private set; }
        public string? DifferencentialDiagnosis { get; private set; }
        public string? TreatmentPlan { get; private set; }
        public string? MedicationsPrescribed { get; private set; }
        public string? ProceduresPerformed { get; private set; }
        public string? InvestigationsOrdered { get; private set; }
        public string? FollowUpInstructions { get; private set; }
        public string? Prognosis { get; private set; }
        public string? DoctorNotes { get; private set; }
        public string? PatientEducationProvided { get; private set; }
        public string? DischargeSummary { get; private set; }
        public bool IsConfidential { get; private set; }
        public AccessLevel AccessLevel { get; private set; }
        public Guid CreatedBy { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }

        [ForeignKey("PatientId")]
        [InverseProperty("MedicalRecords")]
        public virtual Patient? Patient { get; private set; }

        [ForeignKey("AppointmentId")]
        [InverseProperty("MedicalRecords")]
        public virtual Appointment? Appointment { get; private set; }

        [ForeignKey("DoctorId")]
        [InverseProperty("MedicalRecords")]
        public virtual Doctor? Doctor { get; private set; }

        [ForeignKey("HospitalId")]
        [InverseProperty("MedicalRecords")]
        public virtual Hospital? Hospital { get; private set; }

        [ForeignKey("CreatedBy")]
        [InverseProperty("CreatedMedicalRecords")]
        public virtual User? Creator { get; private set; }

        [InverseProperty("MedicalRecord")]
        public virtual ICollection<Prescription> Prescriptions { get; private set; } = new List<Prescription>();
        #endregion

        #region Constructor (34)
        public MedicalRecord(
            Guid id,
            string recordNumber,
            Guid patientId,
            Guid appointmentId,
            Guid doctorId,
            Guid hospitalId,
            RecordType recordType,
            string? chiefComplaint,
            string? historyOfPresentIllness,
            string? pastMedicalHistory,
            string? familyHistory,
            string? socialHistory,
            string? reviewOfSystems,
            string? physicalExamination,
            string? vitalSigns,
            string? clinicalFindings,
            string? provisionalDiagnosis,
            string? finalDiagnosis,
            string[] icd10Codes,
            string? differencentialDiagnosis,
            string? treatmentPlan,
            string? medicationsPrescribed,
            string? proceduresPerformed,
            string? investigationsOrdered,
            string? followUpInstructions,
            string? prognosis,
            string? doctorNotes,
            string? patientEducationProvided,
            string? dischargeSummary,
            Guid createdBy
        ) : base(id)
        {
            RecordNumber = recordNumber;
            PatientId = patientId;
            AppointmentId = appointmentId;
            DoctorId = doctorId;
            HospitalId = hospitalId;
            RecordDate = DateOnly.FromDateTime(TimeZoneHelper.GetLocalTimeNow());
            RecordType = recordType;
            ChiefComplaint = chiefComplaint;
            HistoryOfPresentIllness = historyOfPresentIllness;
            PastMedicalHistory = pastMedicalHistory;
            FamilyHistory = familyHistory;
            SocialHistory = socialHistory;
            ReviewOfSystems = reviewOfSystems;
            PhysicalExamination = physicalExamination;
            VitalSigns = vitalSigns;
            ClinicalFindings = clinicalFindings;
            ProvisionalDiagnosis = provisionalDiagnosis;
            FinalDiagnosis = finalDiagnosis;
            Icd10Codes = icd10Codes;
            DifferencentialDiagnosis = differencentialDiagnosis;
            TreatmentPlan = treatmentPlan;
            MedicationsPrescribed = medicationsPrescribed;
            ProceduresPerformed = proceduresPerformed;
            InvestigationsOrdered = investigationsOrdered;
            FollowUpInstructions = followUpInstructions;
            Prognosis = prognosis;
            DoctorNotes = doctorNotes;
            PatientEducationProvided = patientEducationProvided;
            DischargeSummary = dischargeSummary;
            IsConfidential = false;
            AccessLevel = AccessLevel.Restricted;
            CreatedBy = createdBy;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
            UpdatedAt = null;
        }
        #endregion

        #region Setter Methods (34)
        public void SetRecordNumber(string recordNumber) { RecordNumber = recordNumber; }
        public void SetPatientId(Guid patientId) { PatientId = patientId; }
        public void SetAppointmentId(Guid appointmentId) { AppointmentId = appointmentId; }
        public void SetDoctorId(Guid doctorId) { DoctorId = doctorId; }
        public void SetHospitalId(Guid hospitalId) { HospitalId = hospitalId; }
        public void SetRecordDate(DateOnly recordDate) { RecordDate = recordDate; }
        public void SetRecordType(RecordType recordType) { RecordType = recordType; }
        public void SetChiefComplaint(string? chiefComplaint) { ChiefComplaint = chiefComplaint; }
        public void SetHistoryOfPresentIllness(string? historyOfPresentIllness) { HistoryOfPresentIllness = historyOfPresentIllness; }
        public void SetPastMedicalHistory(string? pastMedicalHistory) { PastMedicalHistory = pastMedicalHistory; }
        public void SetFamilyHistory(string? familyHistory) { FamilyHistory = familyHistory; }
        public void SetSocialHistory(string? socialHistory) { SocialHistory = socialHistory; }
        public void SetReviewOfSystems(string? reviewOfSystems) { ReviewOfSystems = reviewOfSystems; }
        public void SetPhysicalExamination(string? physicalExamination) { PhysicalExamination = physicalExamination; }
        public void SetVitalSigns(string? vitalSigns) { VitalSigns = vitalSigns; }
        public void SetClinicalFindings(string? clinicalFindings) { ClinicalFindings = clinicalFindings; }
        public void SetProvisionalDiagnosis(string? provisionalDiagnosis) { ProvisionalDiagnosis = provisionalDiagnosis; }
        public void SetFinalDiagnosis(string? finalDiagnosis) { FinalDiagnosis = finalDiagnosis; }
        public void SetIcd10Codes(string[] icd10Codes) { Icd10Codes = icd10Codes; }
        public void SetDifferencentialDiagnosis(string? differencentialDiagnosis) { DifferencentialDiagnosis = differencentialDiagnosis; }
        public void SetTreatmentPlan(string? treatmentPlan) { TreatmentPlan = treatmentPlan; }
        public void SetMedicationsPrescribed(string? medicationsPrescribed) { MedicationsPrescribed = medicationsPrescribed; }
        public void SetProceduresPerformed(string? proceduresPerformed) { ProceduresPerformed = proceduresPerformed; }
        public void SetInvestigationsOrdered(string? investigationsOrdered) { InvestigationsOrdered = investigationsOrdered; }
        public void SetFollowUpInstructions(string? followUpInstructions) { FollowUpInstructions = followUpInstructions; }
        public void SetPrognosis(string? prognosis) { Prognosis = prognosis; }
        public void SetDoctorNotes(string? doctorNotes) { DoctorNotes = doctorNotes; }
        public void SetPatientEducationProvided(string? patientEducationProvided) { PatientEducationProvided = patientEducationProvided; }
        public void SetDischargeSummary(string? dischargeSummary) { DischargeSummary = dischargeSummary; }
        public void SetIsConfidential(bool isConfidential) { IsConfidential = isConfidential; }
        public void SetAccessLevel(AccessLevel accessLevel) { AccessLevel = accessLevel; }
        public void SetCreatedBy(Guid createdBy) { CreatedBy = createdBy; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        public void SetUpdatedAt(DateTime updatedAt) { UpdatedAt = updatedAt; }
        #endregion
    }
}
