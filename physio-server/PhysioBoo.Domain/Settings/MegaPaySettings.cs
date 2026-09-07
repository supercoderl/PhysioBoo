namespace PhysioBoo.Domain.Settings
{
    public sealed class MegaPaySettings
    {
        public const string SectionName = "Gateways:MegaPay";

        public required string MerId { get; init; }
        public required string EncodeKey { get; init; }
        public required string RefundPassword { get; init; }
        public required string BaseUrl { get; init; }
        public required string CallBackUrl { get; init; }
        public required string NotiUrl { get; init; }
        public required string ReqDomain { get; init; }
        public string? DefaultLinkExpTime { get; init; }
        public string WindowColor { get; init; } = "#ef5459";
        public int HttpTimeoutSeconds { get; init; } = 30;

        public const string HttpClientName = "MegaPayHttpClient";
    }
}
