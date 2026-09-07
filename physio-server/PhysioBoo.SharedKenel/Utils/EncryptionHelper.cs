using System.Security.Cryptography;
using System.Text;

namespace PhysioBoo.SharedKernel.Utils
{
    /// <summary>
    /// Symmetric encryption/decryption primitives shared across payment gateways and other integrations.
    /// Each method group corresponds to one algorithm/mode a provider's protocol requires; keys are passed
    /// per call so any gateway can reuse these without duplicating the underlying cipher plumbing.
    /// Hashing/HMAC/signing lives separately in <see cref="HashHelper"/>.
    /// </summary>
    public static class EncryptionHelper
    {
        /// <summary>AES-CBC encrypt: random IV generated, prepended to ciphertext, hex-encoded.</summary>
        public static string AesCbcEncrypt(string plainText, string keyHex) => AesCbcEncrypt(plainText, Convert.FromHexString(keyHex));

        /// <summary>AES-CBC encrypt: random IV generated, prepended to ciphertext, hex-encoded.</summary>
        public static string AesCbcEncrypt(string plainText, byte[] key)
        {
            ValidateAesKeySize(key);

            using Aes aes = Aes.Create();
            aes.Key = key;
            aes.Mode = CipherMode.CBC;
            aes.Padding = PaddingMode.PKCS7;
            aes.GenerateIV();

            using ICryptoTransform encryptor = aes.CreateEncryptor();
            byte[] plainBytes = Encoding.UTF8.GetBytes(plainText);
            byte[] cipherBytes = encryptor.TransformFinalBlock(plainBytes, 0, plainBytes.Length);

            byte[] result = new byte[aes.IV.Length + cipherBytes.Length];
            Buffer.BlockCopy(aes.IV, 0, result, 0, aes.IV.Length);
            Buffer.BlockCopy(cipherBytes, 0, result, aes.IV.Length, cipherBytes.Length);

            return Convert.ToHexString(result).ToLowerInvariant();
        }

        /// <summary>AES-CBC decrypt: expects a hex payload with the 16-byte IV prepended to the ciphertext.</summary>
        public static string AesCbcDecrypt(string hexPayload, string keyHex) => AesCbcDecrypt(hexPayload, Convert.FromHexString(keyHex));

        /// <summary>AES-CBC decrypt: expects a hex payload with the 16-byte IV prepended to the ciphertext.</summary>
        public static string AesCbcDecrypt(string hexPayload, byte[] key)
        {
            ValidateAesKeySize(key);

            byte[] all = Convert.FromHexString(hexPayload);
            if (all.Length <= 16)
                throw new CryptographicException("Ciphertext too short to contain an IV.");

            byte[] iv = all[..16];
            byte[] cipherBytes = all[16..];

            using Aes aes = Aes.Create();
            aes.Key = key;
            aes.Mode = CipherMode.CBC;
            aes.Padding = PaddingMode.PKCS7;
            aes.IV = iv;

            using ICryptoTransform decryptor = aes.CreateDecryptor();
            byte[] plainBytes = decryptor.TransformFinalBlock(cipherBytes, 0, cipherBytes.Length);
            return Encoding.UTF8.GetString(plainBytes);
        }

        /// <summary>Triple DES (3DES) ECB decrypt. Legacy mode kept only for gateways whose protocol mandates it.</summary>
        public static byte[] TripleDesEcbDecrypt(byte[] key, byte[] cipher)
        {
            using TripleDES des = TripleDES.Create();
            des.Key = key;
            des.Mode = CipherMode.ECB;
            des.Padding = PaddingMode.PKCS7;
            using ICryptoTransform decryptor = des.CreateDecryptor();
            return decryptor.TransformFinalBlock(cipher, 0, cipher.Length);
        }

        private static void ValidateAesKeySize(byte[] key)
        {
            if (key.Length is not (16 or 24 or 32))
                throw new ArgumentException("AES key must be 16, 24, or 32 bytes (AES-128/192/256).", nameof(key));
        }
    }
}
