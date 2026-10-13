using System.Text.Json;

namespace PhysioBoo.Application.Commands.HospitalGroups
{
    internal static class HospitalGroupJson
    {
        /// <summary>The column is jsonb, so anything that is not JSON would fail at the database with an opaque error.</summary>
        public static bool IsValidOrEmpty(string? json)
        {
            if (string.IsNullOrWhiteSpace(json)) return true;

            try
            {
                using JsonDocument _ = JsonDocument.Parse(json);
                return true;
            }
            catch (JsonException)
            {
                return false;
            }
        }
    }
}
