using System.Globalization;

namespace PhysioBoo.SharedKernel.Utils
{
    public static class TimeZoneHelper
    {
        /// <summary>
        /// Return current system's TimeZoneId (Ex: "SE Asia Standard Time")
        /// </summary>
        public static string GetLocalTimeZoneId()
        {
            return TimeZoneInfo.Local.Id;
        }

        /// <summary>
        /// Convert from UTC to local by TimeZoneId
        /// </summary>
        public static DateTime GetCurrentTimeByZoneId(string timeZoneId)
        {
            var tz = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
            return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tz);
        }

        /// <summary>
        /// Return current system's local time
        /// </summary>
        public static DateTime GetLocalTimeNow()
        {
            return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.Local);
        }

        /// <summary>
        /// Try convert UTC to time by TimeZoneId, if error, return null
        /// </summary>
        public static DateTime? TryGetCurrentTimeByZoneId(string timeZoneId)
        {
            try
            {
                var tz = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
                return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tz);
            }
            catch
            {
                return null;
            }
        }

        /// <summary>
        /// Convert any DateTime UTC to local time by system's TimeZoneId
        /// </summary>
        public static DateTime ConvertUtcToLocal(DateTime utcTime)
        {
            return TimeZoneInfo.ConvertTimeFromUtc(utcTime, TimeZoneInfo.Local);
        }

        /// <summary>
        /// Convert any DateTime UTC to local time by system's TimeZoneId
        /// </summary>
        public static DateTimeOffset ConvertUtcToLocal(DateTimeOffset utcTime, TimeZoneInfo timeZone)
        {
            var localDateTime = TimeZoneInfo.ConvertTimeFromUtc(utcTime.UtcDateTime, timeZone);
            var offset = timeZone.GetUtcOffset(localDateTime);
            return new DateTimeOffset(localDateTime, offset);
        }

        /// <summary>
        /// Convert string (e.g. "2025-07-15T12:00:00") to DateTime with Local kind.
        /// </summary>
        /// <param name="dateTimeString">ISO format without Z</param>
        /// <param name="result">Parsed DateTime (output)</param>
        /// <returns>True if parsed successfully; false otherwise</returns>
        public static bool TryParseLocalDateTime(string dateTimeString, out DateTime result)
        {
            bool success = DateTime.TryParseExact(
                dateTimeString,
                "yyyy-MM-ddTHH:mm:ss",
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out result
            );

            if (success)
            {
                // Ensure it's marked as Local kind
                result = DateTime.SpecifyKind(result, DateTimeKind.Local);
            }

            return success;
        }
    }
}
