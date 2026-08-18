namespace PhysioBoo.SharedKernel.Utils
{
    public static class AgeHelper
    {
        /// <summary>
        /// Calculate age in full years from a birth date, as of a given date (defaults to today).
        /// Handles leap-year birthdays (Feb 29) correctly.
        /// </summary>
        /// <param name="birthDate">Patient's date of birth</param>
        /// <param name="asOfDate">Reference date to calculate age at (defaults to today's local date)</param>
        /// <exception cref="ArgumentException">Thrown when birthDate is later than asOfDate</exception>
        public static int CalculateAge(DateOnly birthDate, DateOnly? asOfDate = null)
        {
            DateOnly today = asOfDate ?? DateOnly.FromDateTime(TimeZoneHelper.GetLocalTimeNow());

            if (birthDate > today)
                throw new ArgumentException("Birth date cannot be later than the reference date.", nameof(birthDate));

            int age = today.Year - birthDate.Year;

            if (birthDate > today.AddYears(-age))
                age--;

            return age;
        }

        /// <summary>
        /// Calculate age in full years from a birth date, as of a given date (defaults to today).
        /// Time-of-day is ignored.
        /// </summary>
        public static int CalculateAge(DateTime birthDate, DateTime? asOfDate = null)
        {
            return CalculateAge(
                DateOnly.FromDateTime(birthDate),
                asOfDate.HasValue ? DateOnly.FromDateTime(asOfDate.Value) : null);
        }

        /// <summary>
        /// Try to calculate age without throwing. Returns false if birthDate is null or later than asOfDate.
        /// </summary>
        public static bool TryCalculateAge(DateOnly? birthDate, out int age, DateOnly? asOfDate = null)
        {
            age = 0;

            if (birthDate is null)
                return false;

            DateOnly today = asOfDate ?? DateOnly.FromDateTime(TimeZoneHelper.GetLocalTimeNow());

            if (birthDate.Value > today)
                return false;

            age = CalculateAge(birthDate.Value, today);
            return true;
        }

        /// <summary>
        /// Calculate a detailed age breakdown (years, months, days) from a birth date, as of a given date.
        /// Useful for pediatric/neonatal patients where whole-year age isn't descriptive enough.
        /// </summary>
        /// <exception cref="ArgumentException">Thrown when birthDate is later than asOfDate</exception>
        public static (int Years, int Months, int Days) CalculateAgeBreakdown(DateOnly birthDate, DateOnly? asOfDate = null)
        {
            DateOnly today = asOfDate ?? DateOnly.FromDateTime(TimeZoneHelper.GetLocalTimeNow());

            if (birthDate > today)
                throw new ArgumentException("Birth date cannot be later than the reference date.", nameof(birthDate));

            int years = today.Year - birthDate.Year;
            int months = today.Month - birthDate.Month;
            int days = today.Day - birthDate.Day;

            if (days < 0)
            {
                months--;
                days += DateTime.DaysInMonth(today.Year, today.Month == 1 ? 12 : today.Month - 1);
            }

            if (months < 0)
            {
                years--;
                months += 12;
            }

            return (years, months, days);
        }

        /// <summary>
        /// Format an age breakdown as a human-readable string.
        /// Example: "2 years, 3 months" for a toddler; "5 months, 12 days" for an infant.
        /// </summary>
        public static string FormatAge(DateOnly birthDate, DateOnly? asOfDate = null)
        {
            (int years, int months, int days) = CalculateAgeBreakdown(birthDate, asOfDate);

            if (years > 0)
                return months > 0
                    ? $"{years} year{(years == 1 ? "" : "s")}, {months} month{(months == 1 ? "" : "s")}"
                    : $"{years} year{(years == 1 ? "" : "s")}";

            if (months > 0)
                return days > 0
                    ? $"{months} month{(months == 1 ? "" : "s")}, {days} day{(days == 1 ? "" : "s")}"
                    : $"{months} month{(months == 1 ? "" : "s")}";

            return $"{days} day{(days == 1 ? "" : "s")}";
        }

        /// <summary>
        /// Check whether the person is a minor (under 18 years old) as of a given date.
        /// </summary>
        public static bool IsMinor(DateOnly birthDate, DateOnly? asOfDate = null)
        {
            return CalculateAge(birthDate, asOfDate) < 18;
        }
    }
}
