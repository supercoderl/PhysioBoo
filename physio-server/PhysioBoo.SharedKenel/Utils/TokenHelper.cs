using PhysioBoo.SharedKernel.Utils;
using System.Security.Cryptography;
using System.Text;

namespace PhysioBoo.SharedKenel.Utils
{
    public static class TokenHelper
    {
        /// <summary>
        /// Generates a simple GUID-based token (least secure but easiest)
        /// </summary>
        public static string GenerateSimpleToken()
        {
            return Guid.NewGuid().ToString("N"); // No hyphens
        }

        /// <summary>
        /// Generates a cryptographically secure random token using RNG
        /// </summary>
        /// <param name="length">Token length in bytes (will be base64 encoded, so actual string will be longer)</param>
        public static string GenerateSecureToken(int length = 32)
        {
            using var rng = RandomNumberGenerator.Create();
            var bytes = new byte[length];
            rng.GetBytes(bytes);
            return Convert.ToBase64String(bytes).Replace("/", "_").Replace("+", "-").TrimEnd('=');
        }

        /// <summary>
        /// Generates a URL-safe token using only alphanumeric characters
        /// </summary>
        /// <param name="length">Desired token length</param>
        public static string GenerateUrlSafeToken(int length = 32)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            using var rng = RandomNumberGenerator.Create();
            var bytes = new byte[length];
            rng.GetBytes(bytes);

            var result = new StringBuilder(length);
            foreach (byte b in bytes)
            {
                result.Append(chars[b % chars.Length]);
            }

            return result.ToString();
        }

        /// <summary>
        /// Generates a numeric-only token (useful for SMS verification)
        /// </summary>
        /// <param name="length">Token length (default 6 digits)</param>
        public static string GenerateNumericToken(int length = 6)
        {
            using var rng = RandomNumberGenerator.Create();
            var bytes = new byte[length];
            rng.GetBytes(bytes);

            var result = new StringBuilder(length);
            for (int i = 0; i < length; i++)
            {
                result.Append(bytes[i] % 10);
            }

            return result.ToString();
        }

        /// <summary>
        /// Generates a token with custom expiration time
        /// </summary>
        /// <param name="expirationHours">Token expiration in hours</param>
        public static (string Token, DateTime ExpiresAt) GenerateTokenWithExpiration(int expirationHours = 24)
        {
            var token = GenerateSecureToken();
            var expiresAt = TimeZoneHelper.GetLocalTimeNow().AddHours(expirationHours);

            return (token, expiresAt);
        }

        /// <summary>
        /// Generates a token with embedded timestamp (for validation without database lookup)
        /// Note: This is less secure as the timestamp is embedded in the token
        /// </summary>
        /// <param name="expirationHours">Token expiration in hours</param>
        public static string GenerateTimestampedToken(int expirationHours = 24)
        {
            var expiresAt = new DateTimeOffset(TimeZoneHelper.GetLocalTimeNow().AddHours(expirationHours));
            var timestamp = expiresAt.ToUnixTimeSeconds();
            var randomPart = GenerateSecureToken(16);

            var tokenData = $"{timestamp}:{randomPart}";
            var tokenBytes = Encoding.UTF8.GetBytes(tokenData);

            return Convert.ToBase64String(tokenBytes).Replace("/", "_").Replace("+", "-").TrimEnd('=');
        }

        /// <summary>
        /// Validates a timestamped token without database lookup
        /// </summary>
        /// <param name="token">The timestamped token to validate</param>
        public static bool IsTimestampedTokenValid(string token)
        {
            try
            {
                // Restore base64 padding and convert back
                var paddedToken = token.Replace("_", "/").Replace("-", "+");
                while (paddedToken.Length % 4 != 0)
                    paddedToken += "=";

                var tokenBytes = Convert.FromBase64String(paddedToken);
                var tokenData = Encoding.UTF8.GetString(tokenBytes);

                var parts = tokenData.Split(':');
                if (parts.Length != 2)
                    return false;

                if (!long.TryParse(parts[0], out var timestamp))
                    return false;

                var expiresAt = DateTimeOffset.FromUnixTimeSeconds(timestamp);
                return new DateTimeOffset(TimeZoneHelper.GetLocalTimeNow()) < expiresAt;
            }
            catch
            {
                return false;
            }
        }
    }
}
