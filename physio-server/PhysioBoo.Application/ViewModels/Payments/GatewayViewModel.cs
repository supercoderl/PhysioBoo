

using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Payments
{
    /// <summary>Everything a gateway needs to create a new payment session.</summary>
    public sealed record GatewayCreateViewModel
    {
        public required string MerchantReference { get; init; }
        public required string InvoiceNo { get; init; }
        public required long Amount { get; init; }
        public required string Currency { get; init; }
        public required string GoodsName { get; init; }
        public string? Description { get; init; }
        public string? PaymentMethod { get; init; }
        public string? BankCode { get; init; }
        public string? BuyerFirstName { get; init; }
        public string? BuyerLastName { get; init; }
        public string? BuyerEmail { get; init; }
        public string? BuyerPhone { get; init; }
        public string? ExpiresAt { get; init; }
    }

    /// <summary>Raw notification data forwarded from the gateway webhook endpoint.</summary>
    public sealed record GatewayNotificationContext
    {
        /// <summary>Raw HTTP request body (JSON, form, or query string — gateway decides).</summary>
        public required string RawBody { get; init; }

        /// <summary>HTTP headers, used by some gateways for signature verification.</summary>
        public IReadOnlyDictionary<string, string> Headers { get; init; }
            = new Dictionary<string, string>();

        /// <summary>Query-string parameters, for gateways that pass data via URL.</summary>
        public IReadOnlyDictionary<string, string> QueryParams { get; init; }
            = new Dictionary<string, string>();
    }

    /// <summary>What the gateway returns after creating a payment session.</summary>
    public sealed record GatewayCreateResult
    {
        public bool IsSuccess { get; init; }

        /// <summary>Gateway-assigned transaction ID.</summary>
        public string? GatewayTransactionId { get; init; }

        /// <summary>URL for the user to complete the payment (redirect or QR).</summary>
        public string? PaymentUrl { get; init; }

        /// <summary>Base64-encoded QR code image, if the gateway returns one.</summary>
        public string? QrCode { get; init; }

        /// <summary>Raw QR payload text (EMV string), for gateways that don't provide a redirect URL.</summary>
        public string? QrContent { get; init; }

        /// <summary>Payment link / session expiry time (gateway-specific format).</summary>
        public string? ExpiresAt { get; init; }

        public string? Error { get; init; }
        public string? ErrorCode { get; init; }
    }

    /// <summary>Normalised status returned by HandleNotificationAsync or QueryStatusAsync.</summary>
    public sealed record GatewayStatusResult
    {
        public bool IsSuccess { get; init; }
        public TransactionStatus Status { get; init; }
        public string? ResultCode { get; init; }
        public string? ResultMessage { get; init; }
        public string? GatewayTransactionId { get; init; }
        public string? PaymentMethod { get; init; }
        public string? BankCode { get; init; }

        public string? Error { get; init; }
        public string? ErrorCode { get; init; }

        /// <summary>
        /// True when the transaction has reached a terminal state and no further updates are expected.
        /// </summary>
        public bool IsTerminal =>
            Status is TransactionStatus.Succeeded
                or TransactionStatus.Failed
                or TransactionStatus.Cancelled
                or TransactionStatus.Refunded;
    }
}
