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
            TimeZoneInfo tz = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
            return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tz);
        }

        /// <summary>
        /// Return current system's local time
        /// </summary>
        public static DateTime GetLocalTimeNow()
        {
            DateTime local = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.Local);
            return DateTime.SpecifyKind(local, DateTimeKind.Unspecified);
        }

        /// <summary>
        /// Try convert UTC to time by TimeZoneId, if error, return null
        /// </summary>
        public static DateTime? TryGetCurrentTimeByZoneId(string timeZoneId)
        {
            try
            {
                TimeZoneInfo tz = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
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
            DateTime localDateTime = TimeZoneInfo.ConvertTimeFromUtc(utcTime.UtcDateTime, timeZone);
            TimeSpan offset = timeZone.GetUtcOffset(localDateTime);
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

        /// <summary>
        /// Convert DateTime to string (e.g. "2025-07-15T12:00:00").
        /// </summary>
        /// <param name="value">Value can be parsed to date time</param>
        /// <param name="format">string format to wishing date time</param>
        public static string ConvertDateTimeToString(object? value, string format = DateFormats.IsoDateTime, string nullValue = "")
        {
            if (value is null) return nullValue;
            switch (value)
            {
                case DateTime dt:
                    return dt.ToString(format, CultureInfo.InvariantCulture);
                case DateOnly d:
                    return d.ToString(format, CultureInfo.InvariantCulture);
                case DateTimeOffset dto:
                    return dto.ToString(format, CultureInfo.InvariantCulture);
                case string s when !string.IsNullOrWhiteSpace(s):
                    if (DateTime.TryParse(s, CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime parsed))
                        return parsed.ToString(format, CultureInfo.InvariantCulture);
                    return nullValue;
                case string:
                    return nullValue;
                default:
                    return nullValue;
            }
        }
    }

    public static class DateFormats
    {
        // ISO
        public const string IsoDate = "yyyy-MM-dd";
        public const string IsoDateTime = "yyyy-MM-ddTHH:mm:ss";
        public const string IsoDateTimeMs = "yyyy-MM-ddTHH:mm:ss.fff";
        public const string Iso8601 = "O"; // Round-trip

        // Date only
        public const string YearMonthDay = "yyyy-MM-dd";
        public const string YearMonth = "yyyy-MM";
        public const string DayMonthYear = "dd-MM-yyyy";
        public const string MonthDayYear = "MM-dd-yyyy";

        // Short
        public const string ShortYMD = "yy-M-d";
        public const string ShortDMY = "d-M-yy";

        // Time
        public const string Time24 = "HH:mm:ss";
        public const string Time24Minute = "HH:mm";
        public const string Time12 = "hh:mm:ss tt";

        // Common datetime
        public const string DateTime24 = "yyyy-MM-dd HH:mm:ss";
        public const string DateTime24Ms = "yyyy-MM-dd HH:mm:ss.fff";
        public const string DateTime12 = "yyyy-MM-dd hh:mm:ss tt";

        // Compact
        public const string CompactDate = "yyyyMMdd";
        public const string CompactDateTime = "yyyyMMddHHmmss";

        // File safe
        public const string FileTimestamp = "yyyyMMdd_HHmmss";
        public const string FileTimestampMs = "yyyyMMdd_HHmmssfff";

        // Log
        public const string LogTimestamp = "yyyy-MM-dd HH:mm:ss.fff";

        // RFC
        public const string Rfc1123 = "R";

        // Sortable
        public const string Sortable = "s";

        // Universal sortable
        public const string UniversalSortable = "u";
    }
}