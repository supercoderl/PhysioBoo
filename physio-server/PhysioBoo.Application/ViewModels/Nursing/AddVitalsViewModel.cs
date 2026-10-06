namespace PhysioBoo.Application.ViewModels.Nursing
{
    // The UI also sends recordedBy and isAbnormal; the server ignores them (it knows the user and the thresholds).
    public sealed record AddVitalsViewModel(
        DateTime? RecordedAt,
        int BloodPressureSystolic,
        int BloodPressureDiastolic,
        int HeartRate,
        decimal Temperature,
        int RespiratoryRate,
        int Spo2
    );
}
