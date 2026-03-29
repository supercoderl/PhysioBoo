using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace PhysioBoo.SharedKernel.Utils
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
            using RandomNumberGenerator rng = RandomNumberGenerator.Create();
            byte[] bytes = new byte[length];
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
            using RandomNumberGenerator rng = RandomNumberGenerator.Create();
            byte[] bytes = new byte[length];
            rng.GetBytes(bytes);

            StringBuilder result = new StringBuilder(length);
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
            using RandomNumberGenerator rng = RandomNumberGenerator.Create();
            byte[] bytes = new byte[length];
            rng.GetBytes(bytes);

            StringBuilder result = new StringBuilder(length);
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
            string token = GenerateSecureToken();
            DateTime expiresAt = TimeZoneHelper.GetLocalTimeNow().AddHours(expirationHours);

            return (token, expiresAt);
        }

        /// <summary>
        /// Generates a token with embedded timestamp (for validation without database lookup)
        /// Note: This is less secure as the timestamp is embedded in the token
        /// </summary>
        /// <param name="expirationHours">Token expiration in hours</param>
        public static string GenerateTimestampedToken(int expirationHours = 24)
        {
            DateTimeOffset expiresAt = new DateTimeOffset(TimeZoneHelper.GetLocalTimeNow().AddHours(expirationHours));
            long timestamp = expiresAt.ToUnixTimeSeconds();
            string randomPart = GenerateSecureToken(16);

            string tokenData = $"{timestamp}:{randomPart}";
            byte[] tokenBytes = Encoding.UTF8.GetBytes(tokenData);

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
                string paddedToken = token.Replace("_", "/").Replace("-", "+");
                while (paddedToken.Length % 4 != 0)
                    paddedToken += "=";

                byte[] tokenBytes = Convert.FromBase64String(paddedToken);
                string tokenData = Encoding.UTF8.GetString(tokenBytes);

                string[] parts = tokenData.Split(':');
                if (parts.Length != 2)
                    return false;

                if (!long.TryParse(parts[0], out long timestamp))
                    return false;

                DateTimeOffset expiresAt = DateTimeOffset.FromUnixTimeSeconds(timestamp);
                return new DateTimeOffset(TimeZoneHelper.GetLocalTimeNow()) < expiresAt;
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Generate access token
        /// </summary>
        /// <param name="data">The dictionary with some datas</param>
        public static (string AccessToken, string RefreshToken) BuildAuthToken(
            Dictionary<string, string> claimDatas,
            string secret,
            string issuer,
            string audience,
            int expiryDurationMinutes = 15
        )
        {
            Claim[] claims = new[]
            {
                new Claim(ClaimTypes.Email, claimDatas["Email"]),
                new Claim(ClaimTypes.NameIdentifier, claimDatas["Id"]),
                new Claim(ClaimTypes.Name, claimDatas["Name"]),
                new Claim("TenantId", claimDatas["TenantId"])
            };

            SymmetricSecurityKey securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));

            SigningCredentials credentials = new SigningCredentials(
                securityKey,
                SecurityAlgorithms.HmacSha256Signature
            );

            JwtSecurityToken tokenDescriptor = new JwtSecurityToken(
                issuer,
                audience,
                claims,
                expires: TimeZoneHelper.GetLocalTimeNow().AddMinutes(expiryDurationMinutes),
                signingCredentials: credentials);

            string refreshToken = GenerateSecureToken(32);
            string accessToken = new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);

            return (accessToken, refreshToken);
        }
    }
}
