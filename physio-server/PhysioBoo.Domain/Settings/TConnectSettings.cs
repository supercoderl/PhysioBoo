namespace PhysioBoo.Domain.Settings
{
    public sealed class TConnectSettings
    {
        public const string SectionName = "PaymentGateway:TConnect";

        public required string PartnerCode { get; init; }
        public required string Username { get; init; }
        public required string Password { get; init; }
        public required string ClientId { get; init; }
        public required string ClientSecret { get; init; }
        public required string AesKeyHex { get; init; }
        public required string BaseUrl { get; init; }
        public required string ServiceCode { get; init; }
        public required string BinCode { get; init; }
        public required string Va { get; init; }
        public int HttpTimeoutSeconds { get; init; } = 30;

        public const string HttpClientName = "TConnectHttpClient";
    }
}
