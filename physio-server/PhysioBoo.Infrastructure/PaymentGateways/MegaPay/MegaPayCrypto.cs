using PhysioBoo.SharedKernel.Utils;
using System.Security.Cryptography;
using System.Text;

namespace PhysioBoo.Infrastructure.PaymentGateways.MegaPay
{
    /// <summary>
    /// All cryptographic operations required by the MegaPay protocol.
    /// Internal to this gateway; nothing outside this folder uses it.
    /// </summary>
    internal sealed class MegaPayCrypto
    {
        private readonly byte[] _decryptKey;
        private readonly byte[] _encryptKey;
        private readonly string _encodeKey;

        internal MegaPayCrypto(string encodeKey)
        {
            if (string.IsNullOrEmpty(encodeKey) || encodeKey.Length < 24)
                throw new ArgumentException("EncodeKey must be at least 24 characters.", nameof(encodeKey));

            _encodeKey = encodeKey;
            _decryptKey = NormalizeTripleDesKey(Encoding.UTF8.GetBytes(encodeKey[..24]));
            _encryptKey = NormalizeTripleDesKey(Encoding.UTF8.GetBytes(encodeKey[^24..]));
        }

        /// <summary>Outbound: sign the create-link request.</summary>
        internal string SignCreateLinkRequest(string timeStamp, string invoiceNo, string merId, string amount, string linkExptime)
            => HashHelper.ComputeHash(HashAlgorithmName.SHA256, timeStamp, invoiceNo, merId, amount, linkExptime, _encodeKey);

        /// <summary>Outbound: sign the inquiry request.</summary>
        internal string SignInquiryRequest(string timeStamp, string merTrxId, string merId)
            => HashHelper.ComputeHash(HashAlgorithmName.SHA256, timeStamp, merTrxId, merId, _encodeKey);

        /// <summary>Validate the create-link response token.</summary>
        internal bool VerifyCreateLinkResponse(
            string token, string resultCd, string timeStamp, string merId,
            string invoiceNo, string amount, string payType,
            string? payOption, string? linkExptime, string? paymentLink, string? qrCode)
        {
            string expected = HashHelper.ComputeHash(
                HashAlgorithmName.SHA256,
                resultCd, timeStamp, merId, invoiceNo, amount, payType,
                payOption ?? "", linkExptime ?? "", paymentLink ?? "", qrCode ?? "",
                _encodeKey);
            return HashHelper.ConstantTimeEquals(expected, token);
        }

        /// <summary>
        /// Validate IPN, callback, or inquiry response token. 
        /// Formula switches based on whether userFee &gt; 0.
        /// </summary>
        internal bool VerifyResponseToken(
            string token, string resultCd, string timeStamp,
            string merTrxId, string trxId, string merId,
            string amount, string? userFee)
        {
            string expected = BuildResponseToken(resultCd, timeStamp, merTrxId, trxId, merId, amount, userFee);
            return HashHelper.ConstantTimeEquals(expected, token);
        }

        /// <summary>Decrypt the paymentLink hex ciphertext. Key = first 24 chars of encodeKey.</summary>
        internal string DecryptPaymentLink(string hexCipher)
        {
            if (string.IsNullOrEmpty(hexCipher)) return string.Empty;
            byte[] cipher = Convert.FromHexString(hexCipher);
            byte[] plain = EncryptionHelper.TripleDesEcbDecrypt(_decryptKey, cipher);
            return Encoding.UTF8.GetString(plain);
        }

        private string BuildResponseToken(string resultCd, string timeStamp, string merTrxId, string trxId, string merId, string amount, string? userFee)
        {
            bool hasUserFee = !string.IsNullOrEmpty(userFee) && long.TryParse(userFee, out long fee) && fee > 0;

            return hasUserFee
                ? HashHelper.ComputeHash(HashAlgorithmName.SHA256, resultCd, timeStamp, merTrxId, trxId, merId, amount, userFee!, _encodeKey)
                : HashHelper.ComputeHash(HashAlgorithmName.SHA256, resultCd, timeStamp, merTrxId, trxId, merId, amount, _encodeKey);
        }

        private static byte[] NormalizeTripleDesKey(byte[] key)
        {
            if (key.Length is 16 or 24) return key;
            int target = key.Length > 16 ? 24 : 16;
            byte[] norm = new byte[target];
            Buffer.BlockCopy(key, 0, norm, 0, Math.Min(key.Length, target));
            return norm;
        }
    }
}
