namespace PhysioBoo.Application.Queries.Nursing
{
    // Adult reference thresholds used to flag a reading when it is recorded.
    internal static class VitalThresholds
    {
        public readonly record struct Result(bool IsAbnormal, bool IsCritical, string Summary);

        public static Result Evaluate(int systolic, int diastolic, int heartRate, decimal temperature, int respiratoryRate, int spo2)
        {
            List<string> findings = new();
            bool critical = false;

            void Check(bool abnormal, bool isCritical, string text)
            {
                if (!abnormal) return;
                findings.Add(text);
                critical |= isCritical;
            }

            Check(systolic < 90 || systolic > 140 || diastolic < 60 || diastolic > 90,
                  systolic < 80 || systolic > 180 || diastolic > 120,
                  $"BP {systolic}/{diastolic}");
            Check(heartRate < 50 || heartRate > 110, heartRate < 40 || heartRate > 130, $"HR {heartRate}");
            Check(temperature < 36.0m || temperature > 38.0m, temperature < 35.0m || temperature > 39.5m, $"Temp {temperature}");
            Check(respiratoryRate < 12 || respiratoryRate > 20, respiratoryRate < 8 || respiratoryRate > 30, $"RR {respiratoryRate}");
            Check(spo2 < 94, spo2 < 88, $"SpO2 {spo2}%");

            return new Result(findings.Count > 0, critical, string.Join(", ", findings));
        }
    }
}
