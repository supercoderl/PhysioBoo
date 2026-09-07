using System.Text.Json.Serialization;

namespace PhysioBoo.Infrastructure.PaymentGateways.TConnect.Models
{
    internal static class TConnectStatus
    {
        public const string Success = "SUCCESS";
        public const string Pending = "PENDING";
    }

    internal sealed class EncryptedEnvelope
    {
        [JsonPropertyName("data")] public required string Data { get; init; }
    }

    internal sealed class LoginPayload
    {
        [JsonPropertyName("username")] public required string Username { get; init; }
        [JsonPropertyName("password")] public required string Password { get; init; }
        [JsonPropertyName("client_id")] public required string ClientId { get; init; }
        [JsonPropertyName("client_secret")] public required string ClientSecret { get; init; }
    }

    internal sealed class LoginResponse
    {
        [JsonPropertyName("access_token")] public string? AccessToken { get; init; }
        [JsonPropertyName("expires_in")] public int ExpiresIn { get; init; }
        [JsonPropertyName("refresh_token")] public string? RefreshToken { get; init; }
        [JsonPropertyName("refresh_expires_in")] public int RefreshExpiresIn { get; init; }
        [JsonPropertyName("token_type")] public string? TokenType { get; init; }
    }

    internal sealed class CreateQrPayload
    {
        [JsonPropertyName("req_id")] public required string ReqId { get; init; }
        [JsonPropertyName("order_id")] public required string OrderId { get; init; }
        [JsonPropertyName("va")] public required string Va { get; init; }
        [JsonPropertyName("bincode")] public required string BinCode { get; init; }
        [JsonPropertyName("amount")] public required long Amount { get; init; }
    }

    internal sealed class CreateQrResponse
    {
        [JsonPropertyName("image_png_base64")] public string? ImagePngBase64 { get; init; }
        [JsonPropertyName("qr_content")] public string? QrContent { get; init; }
    }

    internal sealed class CheckStatusPayload
    {
        [JsonPropertyName("order_id")] public required string OrderId { get; init; }
        [JsonPropertyName("acc_no")] public string? AccNo { get; init; }
    }

    internal sealed class CheckStatusResponse
    {
        [JsonPropertyName("message")] public string? Message { get; init; }
        [JsonPropertyName("tx_data")] public TxData? TxData { get; init; }
    }

    internal sealed class TxData
    {
        [JsonPropertyName("order_id")] public string? OrderId { get; init; }
        [JsonPropertyName("acc_no")] public string? AccNo { get; init; }
        [JsonPropertyName("total_amount_paid")] public long TotalAmountPaid { get; init; }
        [JsonPropertyName("transactions")] public List<TxTransaction> Transactions { get; init; } = [];
    }

    internal sealed class TxTransaction
    {
        [JsonPropertyName("request_id")] public string? RequestId { get; init; }
        [JsonPropertyName("status")] public string? Status { get; init; }
        [JsonPropertyName("amount")] public long Amount { get; init; }
        [JsonPropertyName("trn_ref_no")] public string? TrnRefNo { get; init; }
        [JsonPropertyName("narrative")] public string? Narrative { get; init; }
        [JsonPropertyName("txn_init_dt")] public string? TxnInitDt { get; init; }
    }

    internal sealed class IpnPayload
    {
        [JsonPropertyName("order_id")] public required string OrderId { get; init; }
        [JsonPropertyName("amount")] public decimal Amount { get; init; }
        [JsonPropertyName("payment_type")] public string? PaymentType { get; init; }
        [JsonPropertyName("retrieval_ref_no")] public string? RetrievalRefNo { get; init; }
        [JsonPropertyName("request_id")] public string? RequestId { get; init; }
        [JsonPropertyName("narrative")] public string? Narrative { get; init; }
        [JsonPropertyName("acc_no")] public string? AccNo { get; init; }
        [JsonPropertyName("original_transaction_date")] public long OriginalTransactionDate { get; init; }
    }
}
