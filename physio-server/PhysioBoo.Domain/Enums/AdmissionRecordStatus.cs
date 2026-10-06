namespace PhysioBoo.Domain.Enums
{
    // Lifecycle of an Admission record. Not the same as AdmissionStatus, which describes a
    // patient's current encounter state (Outpatient, ED, ICU, ...) in the medical-record context.
    public enum AdmissionRecordStatus
    {
        Admitted,
        Discharged,
        Cancelled
    }
}
