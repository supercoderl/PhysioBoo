using PhysioBoo.Domain.Entities.Inpatient;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.Commands.Nursing.GenerateHandover
{
    // Writes the four SBAR parts from structured data, so the handover reflects what was actually recorded.
    internal static class HandoverComposer
    {
        private const int MaxLength = 1900;

        public static (string Situation, string Background, string Assessment, string Recommendation) Compose(
            NursingAssignment assignment,
            BedAssignment? stay,
            VitalSign? lastVitals,
            IReadOnlyList<NursingTask> pendingTasks,
            int dueMedicationCount,
            IReadOnlyList<ClinicalAlert> openAlerts,
            DateTime now)
        {
            Admission admission = assignment.Admission!;
            string name = admission.Patient?.Profile?.FullName ?? "Patient";
            string bed = stay?.Bed == null ? "no bed" : $"bed {stay.Bed.Number}, {stay.Bed.Ward?.Name}";

            List<string> flags = new();
            if (assignment.FallRisk) flags.Add("fall risk");
            if (stay?.Bed?.IsolationRequired == true || stay?.Bed?.BedType == BedType.Isolation) flags.Add("isolation");
            if (admission.AdmissionType == AdmissionType.Emergency) flags.Add("emergency admission");

            string situation = $"{name} ({bed}). Provisional diagnosis: {admission.ProvisionalDiagnosis}. "
                             + $"Acuity {assignment.Acuity}{(flags.Count > 0 ? ", " + string.Join(", ", flags) : string.Empty)}.";

            string doctor = admission.Doctor?.User?.Profile?.FullName ?? "the attending doctor";
            string allergies = string.IsNullOrWhiteSpace(admission.Allergies) ? "none recorded" : admission.Allergies;
            string background = $"Admitted {admission.AdmittedAt:dd MMM HH:mm} ({admission.AdmissionType}) under {doctor}. "
                              + $"Chief complaint: {admission.ChiefComplaint}. Allergies: {allergies}.";

            string vitals = lastVitals == null
                ? "No vitals recorded in the last 24 hours."
                : $"Last vitals {lastVitals.RecordedAt:dd MMM HH:mm}: BP {lastVitals.BloodPressureSystolic}/{lastVitals.BloodPressureDiastolic}, "
                  + $"HR {lastVitals.HeartRate}, Temp {lastVitals.Temperature}, RR {lastVitals.RespiratoryRate}, SpO2 {lastVitals.Spo2}%"
                  + $"{(lastVitals.IsAbnormal ? " (abnormal)" : string.Empty)}.";
            string alerts = openAlerts.Count == 0
                ? "No open alerts."
                : $"{openAlerts.Count} open alert(s): {string.Join("; ", openAlerts.Take(3).Select(a => a.Message))}.";
            string assessment = $"{vitals} {alerts}";

            int overdue = pendingTasks.Count(t => t.DueAt < now);
            string tasks = pendingTasks.Count == 0
                ? "No pending tasks."
                : $"Pending tasks ({pendingTasks.Count}, {overdue} overdue): "
                  + string.Join("; ", pendingTasks.Take(5).Select(t => $"{t.Label} (due {t.DueAt:HH:mm})")) + ".";
            string recommendation = $"{tasks} {dueMedicationCount} medication dose(s) due soon.";

            return (Trim(situation), Trim(background), Trim(assessment), Trim(recommendation));
        }

        private static string Trim(string text)
        {
            return text.Length <= MaxLength ? text : text[..MaxLength];
        }
    }
}
