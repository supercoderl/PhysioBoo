namespace PhysioBoo.SharedKernel.Utils
{
    public static class CodeGenerationHelper
    {
        private static readonly Random _random = new Random();

        public static string GeneratePatientCode()
        {
            DateTime now = TimeZoneHelper.GetLocalTimeNow();
            string datePart = now.ToString("yyMM");
            int randomPart = _random.Next(100000, 999999);

            return $"PAT-{datePart}-{randomPart}";
        }

        public static string GenerateDoctorCode()
        {
            DateTime now = TimeZoneHelper.GetLocalTimeNow();
            string yearPart = now.ToString("yy");
            int randomPart = _random.Next(1000, 9999);

            return $"DOC-{yearPart}-{randomPart}";
        }
    }
}
