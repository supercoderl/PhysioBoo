using System.Text.Json.Serialization;

namespace PhysioBoo.Infrastructure.PaymentGateways.MegaPay.Models
{
    internal static class ResultCode
    {
        public const string Success = "00_000";
        public const string DepositCodePendingDeposit = "00_005";
        public const string Pending = "99";
        public const string CustomerCancelled = "PG_ER5";
    }

    internal static class InquiryStatus
    {
        public const string Failed = "-3";
        public const string Pending = "-2";
        public const string NotFound = "-1";
        public const string Success = "0";
        public const string InstallmentCancelled = "1";
        public const string Refunded = "2";
        public const string DepositCodePending = "5";
    }

    internal static class TwoStepStatus
    {
        public const string Authorized = "1";
        public const string Captured = "2";
        public const string AuthorizationCancelled = "3";
        public const string CaptureRejected = "4";
    }

    internal sealed class CreateLinkRequest
    {
        [JsonPropertyName("merId")] public required string MerId { get; init; }
        [JsonPropertyName("currency")] public string Currency { get; init; } = "VND";
        [JsonPropertyName("amount")] public required string Amount { get; init; }
        [JsonPropertyName("invoiceNo")] public required string InvoiceNo { get; init; }
        [JsonPropertyName("goodsNm")] public required string GoodsNm { get; init; }
        [JsonPropertyName("payType")] public required string PayType { get; init; }
        [JsonPropertyName("callBackUrl")] public required string CallBackUrl { get; init; }
        [JsonPropertyName("notiUrl")] public required string NotiUrl { get; init; }
        [JsonPropertyName("reqDomain")] public required string ReqDomain { get; init; }
        [JsonPropertyName("descriptions")] public required string Descriptions { get; init; }
        [JsonPropertyName("merchantToken")] public required string MerchantToken { get; init; }
        [JsonPropertyName("timeStamp")] public required string TimeStamp { get; init; }
        [JsonPropertyName("userLanguage")] public string UserLanguage { get; init; } = "VN";
        [JsonPropertyName("windowColor")] public string WindowColor { get; init; } = "#ef5459";
        [JsonPropertyName("linkExptime")] public string? LinkExptime { get; init; }
        [JsonPropertyName("buyerFirstNm")] public string? BuyerFirstNm { get; init; }
        [JsonPropertyName("buyerLastNm")] public string? BuyerLastNm { get; init; }
        [JsonPropertyName("buyerEmail")] public string? BuyerEmail { get; init; }
        [JsonPropertyName("buyerPhone")] public string? BuyerPhone { get; init; }
        [JsonPropertyName("bankCode")] public string? BankCode { get; init; }
    }

    internal sealed class CreateLinkResponse
    {
        [JsonPropertyName("resultCd")] public required string ResultCd { get; init; }
        [JsonPropertyName("resultMsg")] public string? ResultMsg { get; init; }
        [JsonPropertyName("merId")] public string? MerId { get; init; }
        [JsonPropertyName("invoiceNo")] public string? InvoiceNo { get; init; }
        [JsonPropertyName("amount")] public string? Amount { get; init; }
        [JsonPropertyName("timeStamp")] public string? TimeStamp { get; init; }
        [JsonPropertyName("payType")] public string? PayType { get; init; }
        [JsonPropertyName("payOption")] public string? PayOption { get; init; }
        [JsonPropertyName("linkExptime")] public string? LinkExptime { get; init; }
        [JsonPropertyName("paymentLink")] public string? PaymentLinkEncrypted { get; init; }
        [JsonPropertyName("qrCode")] public string? QrCode { get; init; }
        [JsonPropertyName("merchantToken")] public string? MerchantToken { get; init; }
    }

    internal sealed class IpnPayload
    {
        [JsonPropertyName("resultCd")] public required string ResultCd { get; init; }
        [JsonPropertyName("resultMsg")] public string? ResultMsg { get; init; }
        [JsonPropertyName("merId")] public required string MerId { get; init; }
        [JsonPropertyName("trxId")] public required string TrxId { get; init; }
        [JsonPropertyName("merTrxId")] public required string MerTrxId { get; init; }
        [JsonPropertyName("invoiceNo")] public required string InvoiceNo { get; init; }
        [JsonPropertyName("amount")] public required string Amount { get; init; }
        [JsonPropertyName("status")] public required string Status { get; init; }
        [JsonPropertyName("payType")] public string? PayType { get; init; }
        [JsonPropertyName("bankId")] public string? BankId { get; init; }
        [JsonPropertyName("timeStamp")] public required string TimeStamp { get; init; }
        [JsonPropertyName("userFee")] public string? UserFee { get; init; }
        [JsonPropertyName("payOption")] public string? PayOption { get; init; }
        [JsonPropertyName("merchantToken")] public required string MerchantToken { get; init; }
    }

    internal sealed class InquiryResponse
    {
        [JsonPropertyName("resultCd")] public required string ResultCd { get; init; }
        [JsonPropertyName("resultMsg")] public string? ResultMsg { get; init; }
        [JsonPropertyName("data")] public InquiryData? Data { get; init; }
    }

    internal sealed class InquiryData
    {
        [JsonPropertyName("trxId")] public string? TrxId { get; init; }
        [JsonPropertyName("merId")] public string? MerId { get; init; }
        [JsonPropertyName("merTrxId")] public string? MerTrxId { get; init; }
        [JsonPropertyName("invoiceNo")] public string? InvoiceNo { get; init; }
        [JsonPropertyName("amount")] public string? Amount { get; init; }
        [JsonPropertyName("resultCd")] public string? ResultCd { get; init; }
        [JsonPropertyName("resultMsg")] public string? ResultMsg { get; init; }
        [JsonPropertyName("status")] public string? Status { get; init; }
        [JsonPropertyName("twoStepStatus")] public string? TwoStepStatus { get; init; }
        [JsonPropertyName("payType")] public string? PayType { get; init; }
        [JsonPropertyName("bankId")] public string? BankId { get; init; }
        [JsonPropertyName("timeStamp")] public string? TimeStamp { get; init; }
        [JsonPropertyName("userFee")] public string? UserFee { get; init; }
        [JsonPropertyName("merchantToken")] public string? MerchantToken { get; init; }
    }
}
