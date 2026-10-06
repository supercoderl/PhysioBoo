using PhysioBoo.Domain.Entities.PatientInformation;

namespace PhysioBoo.Domain.Entities.Inpatient
{
    // A nurse looking after one admitted patient during one shift. Acuity and fall risk are the
    // nurse's assessment for that shift; every other risk flag is derived from the admission and bed.
    public class NursingAssignment : TenantEntity
    {
        #region Core NursingAssignment Table (7)
        public Guid AdmissionId { get; private set; }
        public Guid PatientId { get; private set; }
        public Guid NurseUserId { get; private set; }
        public ShiftCode Shift { get; private set; }
        public DateOnly ShiftDate { get; private set; }
        public AcuityLevel Acuity { get; private set; }
        public bool FallRisk { get; private set; }

        public virtual Admission? Admission { get; private set; }
        public virtual Patient? Patient { get; private set; }
        #endregion

        #region Constructor (7)
        public NursingAssignment(
            Guid id,
            Guid admissionId,
            Guid patientId,
            Guid nurseUserId,
            ShiftCode shift,
            DateOnly shiftDate,
            AcuityLevel acuity,
            bool fallRisk
        ) : base(id)
        {
            AdmissionId = admissionId;
            PatientId = patientId;
            NurseUserId = nurseUserId;
            Shift = shift;
            ShiftDate = shiftDate;
            Acuity = acuity;
            FallRisk = fallRisk;
        }
        #endregion

        #region Setter Methods (7)
        public void SetAdmissionId(Guid admissionId) { AdmissionId = admissionId; }
        public void SetPatientId(Guid patientId) { PatientId = patientId; }
        public void SetNurseUserId(Guid nurseUserId) { NurseUserId = nurseUserId; }
        public void SetShift(ShiftCode shift) { Shift = shift; }
        public void SetShiftDate(DateOnly shiftDate) { ShiftDate = shiftDate; }
        public void SetAcuity(AcuityLevel acuity) { Acuity = acuity; }
        public void SetFallRisk(bool fallRisk) { FallRisk = fallRisk; }
        #endregion
    }
}
