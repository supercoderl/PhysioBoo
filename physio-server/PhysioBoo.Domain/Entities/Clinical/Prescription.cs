using PhysioBoo.Domain.Entities.MedicalStaff;
using PhysioBoo.Domain.Entities.Operation;
using PhysioBoo.Domain.Entities.PatientInformation;
using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.Clinical
{
    public class Prescription : Entity
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
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }

        [ForeignKey("PatientId")]
        [InverseProperty("Prescriptions")]
        public virtual Patient? Patient { get; private set; }

        [ForeignKey("DoctorId")]
        [InverseProperty("Prescriptions")]
        public virtual Doctor? Doctor { get; private set; }

        [ForeignKey("AppoinmentId")]
        [InverseProperty("Prescriptions")]
        public virtual Appointment? Appointment { get; private set; }

        [ForeignKey("MedicalRecordId")]
        [InverseProperty("Prescriptions")]
        public virtual MedicalRecord? MedicalRecord { get; private set; }

        [ForeignKey("HospitalId")]
        [InverseProperty("Prescriptions")]
        public virtual Hospital? Hospital { get; private set; }

        [InverseProperty("Prescription")]
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
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
            UpdatedAt = null;
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
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        public void SetUpdatedAt(DateTime? updatedAt) { UpdatedAt = updatedAt; }
        #endregion
    }
}
