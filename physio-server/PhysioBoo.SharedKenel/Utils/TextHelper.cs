using PhoneNumbers;
using System.Net.Mail;

namespace PhysioBoo.SharedKernel.Utils
{
    public static class TextHelper
    {
        public static string Pluralize(string name)
        {
            if (string.IsNullOrEmpty(name)) return name;

            // If end by "y" but before that there is no vowel → change "y" to "ies"
            if (name.EndsWith("y", StringComparison.OrdinalIgnoreCase) &&
                !"aeiou".Contains(name[name.Length - 2]))
            {
                return name.Substring(0, name.Length - 1) + "ies";
            }

            // If ending with "s", "x", "z", "ch", "sh" → add "es"
            if (name.EndsWith("s", StringComparison.OrdinalIgnoreCase) ||
                name.EndsWith("x", StringComparison.OrdinalIgnoreCase) ||
                name.EndsWith("z", StringComparison.OrdinalIgnoreCase) ||
                name.EndsWith("ch", StringComparison.OrdinalIgnoreCase) ||
                name.EndsWith("sh", StringComparison.OrdinalIgnoreCase))
            {
                return name + "es";
            }

            //Default just need +s
            return name + "s";
        }

        /// <summary>
        /// Generate entity number based on current time.
        /// Format: APP-YYYYMMDD-HHMMSS
        /// Example: APP-20250923-182530
        /// </summary>
        public static string GenerateEntityNumber(string prefix)
        {
            DateTime now = TimeZoneHelper.GetLocalTimeNow();

            return $"{prefix}-{now:yyyyMMdd-HHmmss}";
        }

        /// <summary>
        /// Check the value is email or not
        /// Format: first + @ + second
        /// Example: myemail@email.com
        /// </summary>
        public static bool CheckIsEmail(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return false;

            try
            {
                MailAddress addr = new MailAddress(value);
                return addr.Address == value;
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Check the value is email or not
        /// Format: a string number with 10 - 15 characters
        /// Example: +18789876371
        /// </summary>
        public static bool CheckIsPhone(string value, string region = "VN")
        {
            if (string.IsNullOrWhiteSpace(value))
                return false;

            try
            {
                PhoneNumberUtil phoneUtil = PhoneNumberUtil.GetInstance();
                PhoneNumber number = phoneUtil.Parse(value, region);
                return phoneUtil.IsValidNumber(number);
            }
            catch
            {
                return false;
            }
        }
    }
}
