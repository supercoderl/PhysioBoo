using Konscious.Security.Cryptography;
using Microsoft.AspNetCore.Http;
using System.Security.Cryptography;
using System.Text;

namespace PhysioBoo.SharedKernel.Utils
{
    public static class AuthHelper
    {
        private const int SaltSize = 16; // 128 bits
        private const int HashSize = 32; // 256 bits
        private const int DegreeOfParallelism = 2; // Number of threads to use
        private const int Iterations = 3; // Number of iterations
        private const int MemorySize = 64 * 1024; // 64 mb

        // Cache for ThreadLocal RandomNumberGenerator to avoid recreation overhead
        private static readonly ThreadLocal<RandomNumberGenerator> RandomGeneratorCache =
            new ThreadLocal<RandomNumberGenerator>(() => RandomNumberGenerator.Create(), true);

        public static void SetTokenCookie(HttpResponse? response, string key, string value, string? tzId)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = key == "access_token" ? TimeZoneHelper.GetLocalTimeNow().AddMinutes(15) : TimeZoneHelper.GetLocalTimeNow().AddDays(45), // Short expiration for token
                Path = key == "access_token" ? "/" : "/api",
                Domain = null
            };

            response?.Cookies.Append(key, value, cookieOptions);
        }

        public static void RemoveTokenCookie(HttpResponse? response, string key)
        {
            response?.Cookies.Delete(key, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Path = key == "access_token" ? "/" : "/api/users/refresh"
            });
        }

        public static string HashPassword(string password)
        {
            ArgumentException.ThrowIfNullOrEmpty(password);

            // Generate a random salt using cached RNG
            byte[] salt = new byte[SaltSize];
            RandomGeneratorCache.Value!.GetBytes(salt);

            // Create hash
            byte[] hash = HashPasswordInternal(password, salt);

            // Pre-allocate combined array
            var combinedBytes = new byte[SaltSize + HashSize];
            Buffer.BlockCopy(salt, 0, combinedBytes, 0, SaltSize);
            Buffer.BlockCopy(hash, 0, combinedBytes, SaltSize, HashSize);

            // Convert to base64 for storage
            return Convert.ToBase64String(combinedBytes);
        }

        private static byte[] HashPasswordInternal(string password, byte[] salt)
        {
            // Use using statement for proper disposal
            using var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password))
            {
                Salt = salt,
                DegreeOfParallelism = DegreeOfParallelism,
                Iterations = Iterations,
                MemorySize = MemorySize
            };

            return argon2.GetBytes(HashSize);
        }

        public static bool VerifyPassword(string password, string hashedPassword)
        {
            ArgumentException.ThrowIfNullOrEmpty(password);
            ArgumentException.ThrowIfNullOrEmpty(hashedPassword);

            try
            {
                // Decode the stored hash
                byte[] combinedBytes = Convert.FromBase64String(hashedPassword);

                // Validate combined bytes length
                if (combinedBytes.Length != SaltSize + HashSize)
                {
                    return false;
                }

                // Extract salt and hash using Span<T> for better performance
                ReadOnlySpan<byte> combinedSpan = combinedBytes.AsSpan();
                byte[] salt = combinedSpan.Slice(0, SaltSize).ToArray();
                ReadOnlySpan<byte> storedHash = combinedSpan.Slice(SaltSize, HashSize);

                // Compute hash for the input password
                byte[] newHash = HashPasswordInternal(password, salt);

                // Compare the hashes using constant-time comparison
                return CryptographicOperations.FixedTimeEquals(storedHash, newHash);
            }
            catch (FormatException)
            {
                // Invalid base64 string
                return false;
            }
        }
    }
}
