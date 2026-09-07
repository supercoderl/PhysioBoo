using System.Security.Cryptography;
using System.Text;

namespace PhysioBoo.SharedKernel.Utils
{
    /// <summary>
    /// Generic hashing/signing primitives shared across payment gateways and other integrations
    /// that sign requests by concatenating fields and hashing (or HMAC-ing) the result.
    /// Algorithm-agnostic: pass whichever <see cref="HashAlgorithmName"/> the provider's protocol requires.
    /// </summary>
    public static class HashHelper
    {
        /// <summary>Concatenates the UTF-8 bytes of each part and hashes the result. Returns lowercase hex.</summary>
        public static string ComputeHash(HashAlgorithmName algorithm, params string[] parts)
        {
            byte[] buf = ConcatUtf8(parts);
            byte[] hash = HashData(algorithm, buf);
            return Convert.ToHexString(hash).ToLowerInvariant();
        }

        /// <summary>Concatenates the UTF-8 bytes of each part and HMACs the result with <paramref name="key"/>. Returns lowercase hex.</summary>
        public static string ComputeHmac(HashAlgorithmName algorithm, byte[] key, params string[] parts)
        {
            byte[] buf = ConcatUtf8(parts);
            byte[] hash = HmacData(algorithm, key, buf);
            return Convert.ToHexString(hash).ToLowerInvariant();
        }

        /// <summary>Constant-time string comparison, for verifying a signature/token without leaking timing information.</summary>
        public static bool ConstantTimeEquals(string a, string b) =>
            CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(a), Encoding.UTF8.GetBytes(b));

        private static byte[] ConcatUtf8(string[] parts)
        {
            int totalLen = 0;
            foreach (string p in parts) totalLen += Encoding.UTF8.GetByteCount(p);

            byte[] buf = new byte[totalLen];
            int offset = 0;
            foreach (string p in parts) offset += Encoding.UTF8.GetBytes(p, 0, p.Length, buf, offset);

            return buf;
        }

        private static byte[] HashData(HashAlgorithmName algorithm, byte[] data) => algorithm.Name switch
        {
            nameof(HashAlgorithmName.SHA256) => SHA256.HashData(data),
            nameof(HashAlgorithmName.SHA1) => SHA1.HashData(data),
            nameof(HashAlgorithmName.SHA384) => SHA384.HashData(data),
            nameof(HashAlgorithmName.SHA512) => SHA512.HashData(data),
            nameof(HashAlgorithmName.MD5) => MD5.HashData(data),
            _ => throw new NotSupportedException($"Hash algorithm '{algorithm.Name}' is not supported."),
        };

        private static byte[] HmacData(HashAlgorithmName algorithm, byte[] key, byte[] data) => algorithm.Name switch
        {
            nameof(HashAlgorithmName.SHA256) => new HMACSHA256(key).ComputeHash(data),
            nameof(HashAlgorithmName.SHA1) => new HMACSHA1(key).ComputeHash(data),
            nameof(HashAlgorithmName.SHA384) => new HMACSHA384(key).ComputeHash(data),
            nameof(HashAlgorithmName.SHA512) => new HMACSHA512(key).ComputeHash(data),
            nameof(HashAlgorithmName.MD5) => new HMACMD5(key).ComputeHash(data),
            _ => throw new NotSupportedException($"HMAC algorithm '{algorithm.Name}' is not supported."),
        };
    }
}
