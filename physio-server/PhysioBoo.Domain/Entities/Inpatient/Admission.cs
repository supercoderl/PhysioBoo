using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Entities.PatientInformation;

namespace PhysioBoo.Domain.Entities.Inpatient
{
    public class Admission : TenantEntity
    {
        #region Core Admission Table (18)
        public string AdmissionNumber { get; private set; }
        public Guid PatientId { get; private set; }
        public AdmissionType AdmissionType { get; private set; }
        public AdmissionRecordStatus Status { get; private set; }
        public DateTime AdmittedAt { get; private set; }
        public Guid DepartmentId { get; private set; }
        public Guid DoctorId { get; private set; }
        public string? ReferredBy { get; private set; }
        public string ChiefComplaint { get; private set; }
        public string ProvisionalDiagnosis { get; private set; }
        public string? Allergies { get; private set; }
        public string? CurrentMedications { get; private set; }
        public string? MedicalHistory { get; private set; }
        public bool HasInsurance { get; private set; }
        public string? InsuranceProvider { get; private set; }
        public string? PolicyNumber { get; private set; }
        public DateTime? DischargedAt { get; private set; }
        public string? DischargeNotes { get; private set; }

        public virtual Patient? Patient { get; private set; }
        public virtual Department? Department { get; private set; }
        public virtual Doctor? Doctor { get; private set; }
        #endregion

        #region Constructor (18)
        public Admission(
            Guid id,
            string admissionNumber,
            Guid patientId,
            AdmissionType admissionType,
            DateTime admittedAt,
            Guid departmentId,
            Guid doctorId,
            string? referredBy,
            string chiefComplaint,
            string provisionalDiagnosis,
            string? allergies,
            string? currentMedications,
            string? medicalHistory,
            bool hasInsurance,
            string? insuranceProvider,
            string? policyNumber
        ) : base(id)
        {
            AdmissionNumber = admissionNumber;
            PatientId = patientId;
            AdmissionType = admissionType;
            Status = AdmissionRecordStatus.Admitted;
            AdmittedAt = admittedAt;
            DepartmentId = departmentId;
            DoctorId = doctorId;
            ReferredBy = referredBy;
            ChiefComplaint = chiefComplaint;
            ProvisionalDiagnosis = provisionalDiagnosis;
            Allergies = allergies;
            CurrentMedications = currentMedications;
            MedicalHistory = medicalHistory;
            HasInsurance = hasInsurance;
            InsuranceProvider = insuranceProvider;
            PolicyNumber = policyNumber;
            DischargedAt = null;
            DischargeNotes = null;
        }
        #endregion

        #region Setter Methods (18)
        public void SetAdmissionNumber(string admissionNumber) { AdmissionNumber = admissionNumber; }
        public void SetPatientId(Guid patientId) { PatientId = patientId; }
        public void SetAdmissionType(AdmissionType admissionType) { AdmissionType = admissionType; }
        public void SetStatus(AdmissionRecordStatus status) { Status = status; }
        public void SetAdmittedAt(DateTime admittedAt) { AdmittedAt = admittedAt; }
        public void SetDepartmentId(Guid departmentId) { DepartmentId = departmentId; }
        public void SetDoctorId(Guid doctorId) { DoctorId = doctorId; }
        public void SetReferredBy(string? referredBy) { ReferredBy = referredBy; }
        public void SetChiefComplaint(string chiefComplaint) { ChiefComplaint = chiefComplaint; }
        public void SetProvisionalDiagnosis(string provisionalDiagnosis) { ProvisionalDiagnosis = provisionalDiagnosis; }
        public void SetAllergies(string? allergies) { Allergies = allergies; }
        public void SetCurrentMedications(string? currentMedications) { CurrentMedications = currentMedications; }
        public void SetMedicalHistory(string? medicalHistory) { MedicalHistory = medicalHistory; }
        public void SetHasInsurance(bool hasInsurance) { HasInsurance = hasInsurance; }
        public void SetInsuranceProvider(string? insuranceProvider) { InsuranceProvider = insuranceProvider; }
        public void SetPolicyNumber(string? policyNumber) { PolicyNumber = policyNumber; }
        public void SetDischargedAt(DateTime? dischargedAt) { DischargedAt = dischargedAt; }
        public void SetDischargeNotes(string? dischargeNotes) { DischargeNotes = dischargeNotes; }
        #endregion
    }
}
