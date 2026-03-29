using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Domain.Entities.Clinical
{
    public class Prescription : TenantEntity
    {
        #region Core Prescription Table (19)
        public string PrescriptionNumber { get; private set; }
        public Guid PatientId { get; private set; }
        public Guid DoctorId { get; private set; }
        public Guid AppoinmentId { get; private set; }
        public Guid MedicalRecordId { get; private set; }
        public Guid HospitalId { get; private set; }
        public DateOnly PrescriptionDate { get; private set; }
        public string? Diagnosis { get; private set; }
        public string? Instructions { get; private set; }
        public decimal TotalAmount { get; private set; }
        public PrescriptionStatus Status { get; private set; }
        public DateOnly? ValidUntil { get; private set; }
        public int RefillCount { get; private set; }
        public int MaxRefills { get; private set; }
        public bool IsDigital { get; private set; }
        public bool IsPrinted { get; private set; }
        public string? PharmacistNotes { get; private set; }

        public virtual User? Creator { get; private set; }
        public virtual User? Updater { get; private set; }
        public virtual Patient? Patient { get; private set; }
        public virtual Doctor? Doctor { get; private set; }
        public virtual Appointment? Appointment { get; private set; }
        public virtual MedicalRecord? MedicalRecord { get; private set; }
        public virtual Hospital? Hospital { get; private set; }
        public virtual HospitalGroup? HospitalGroup { get; private set; }

        public virtual ICollection<PrescriptionItem> PrescriptionItems { get; private set; } = new List<PrescriptionItem>();
        #endregion

        #region Constructor (19)
        public Prescription(
            Guid id,
            string prescriptionNumber,
            Guid patientId,
            Guid doctorId,
            Guid appoinmentId,
            Guid medicalRecordId,
            Guid hospitalId,
            string? diagnosis,
            string? instructions,
            decimal totalAmount,
            DateOnly? validUntil,
            string? pharmacistNotes
        ) : base(id)
        {
            PrescriptionNumber = prescriptionNumber;
            PatientId = patientId;
            DoctorId = doctorId;
            AppoinmentId = appoinmentId;
            MedicalRecordId = medicalRecordId;
            HospitalId = hospitalId;
            PrescriptionDate = DateOnly.FromDateTime(TimeZoneHelper.GetLocalTimeNow());
            Diagnosis = diagnosis;
            Instructions = instructions;
            TotalAmount = totalAmount;
            Status = PrescriptionStatus.Active;
            ValidUntil = validUntil;
            RefillCount = 0;
            MaxRefills = 0;
            IsDigital = false;
            IsPrinted = false;
            PharmacistNotes = pharmacistNotes;
        }
        #endregion

        #region Setter Methods (19)
        public void SetPrescriptionNumber(string prescriptionNumber) { PrescriptionNumber = prescriptionNumber; }
        public void SetPatientId(Guid patientId) { PatientId = patientId; }
        public void SetDoctorId(Guid doctorId) { DoctorId = doctorId; }
        public void SetAppoinmentId(Guid appoinmentId) { AppoinmentId = appoinmentId; }
        public void SetMedicalRecordId(Guid medicalRecordId) { MedicalRecordId = medicalRecordId; }
        public void SetHospitalId(Guid hospitalId) { HospitalId = hospitalId; }
        public void SetPrescriptionDate(DateOnly prescriptionDate) { PrescriptionDate = prescriptionDate; }
        public void SetDiagnosis(string? diagnosis) { Diagnosis = diagnosis; }
        public void SetInstructions(string? instructions) { Instructions = instructions; }
        public void SetTotalAmount(decimal totalAmount) { TotalAmount = totalAmount; }
        public void SetStatus(PrescriptionStatus status) { Status = status; }
        public void SetValidUntil(DateOnly? validUntil) { ValidUntil = validUntil; }
        public void SetRefillCount(int refillCount) { RefillCount = refillCount; }
        public void SetMaxRefills(int maxRefills) { MaxRefills = maxRefills; }
        public void SetIsDigital(bool isDigital) { IsDigital = isDigital; }
        public void SetIsPrinted(bool isPrinted) { IsPrinted = isPrinted; }
        public void SetPharmacistNotes(string? pharmacistNotes) { PharmacistNotes = pharmacistNotes; }
        #endregion
    }
}
