using Microsoft.Extensions.Options;
using PhysioBoo.Application.Interfaces.Payment;
using PhysioBoo.Application.ViewModels.Payments;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Domain.Settings;
using PhysioBoo.Infrastructure.PaymentGateways.TConnect.Models;
using PhysioBoo.SharedKernel.Utils;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace PhysioBoo.Infrastructure.PaymentGateways.TConnect
{
    internal sealed class TConnectGateway : IPaymentGateway
    {
        public string ProviderName => "tconnect";

        private const string CreateQrPath = "/openapi/v1/transaction/qr/generate";
        private const string CheckStatusPath = "/openapi/v1/transaction/qr/order/status";

        private readonly TConnectSettings _settings;
        private readonly TConnectTokenProvider _tokenProvider;
        private readonly IHttpClientFactory _http;
        private readonly IMediatorHandler _bus;
        private static readonly JsonSerializerOptions JsonOpts = new(JsonSerializerDefaults.Web);

        public TConnectGateway(
            IOptions<TConnectSettings> options,
            TConnectTokenProvider tokenProvider,
            IHttpClientFactory http,
            IMediatorHandler bus
        )
        {
            _settings = options?.Value ?? throw new ArgumentNullException(nameof(options));
            _tokenProvider = tokenProvider;
            _http = http;
            _bus = bus;
        }

        public async Task<GatewayCreateResult> CreateAsync(GatewayCreateViewModel request, CancellationToken ct = default)
        {
            string orderId = Truncate(request.MerchantReference, 36);

            CreateQrPayload payload = new CreateQrPayload
            {
                ReqId = Guid.NewGuid().ToString("N"),
                OrderId = orderId,
                Va = _settings.Va,
                BinCode = _settings.BinCode,
                Amount = request.Amount,
            };

            CreateQrResponse? response = await SendEncryptedAsync<CreateQrResponse>(CreateQrPath, payload, ct);
            if (response is null) return new GatewayCreateResult { IsSuccess = false };

            if (string.IsNullOrEmpty(response.ImagePngBase64))
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(TConnectGateway),
                    "Payment provider returned an empty QR response.",
                    ErrorCodes.InvalidPayload
                ));
                return new GatewayCreateResult { IsSuccess = false };
            }

            return new GatewayCreateResult
            {
                IsSuccess = true,
                GatewayTransactionId = orderId,
                QrCode = $"data:image/png;base64,{response.ImagePngBase64}",
                QrContent = response.QrContent,
            };
        }

        public async Task<GatewayStatusResult> QueryStatusAsync(string merchantReference, CancellationToken ct = default)
        {
            CheckStatusPayload payload = new CheckStatusPayload
            {
                OrderId = merchantReference,
                AccNo = _settings.Va,
            };

            CheckStatusResponse? response = await SendEncryptedAsync<CheckStatusResponse>(CheckStatusPath, payload, ct);
            if (response is null) return new GatewayStatusResult { IsSuccess = false };

            if (response.TxData is null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(TConnectGateway),
                    "Payment provider returned no transaction data.",
                    ErrorCodes.InvalidPayload
                ));
                return new GatewayStatusResult { IsSuccess = false };
            }

            TxTransaction? latest = response.TxData.Transactions
                .OrderByDescending(t => t.TxnInitDt, StringComparer.Ordinal)
                .FirstOrDefault();

            if (latest is null)
            {
                return new GatewayStatusResult
                {
                    IsSuccess = true,
                    Status = TransactionStatus.Pending,
                    GatewayTransactionId = merchantReference,
                };
            }

            return new GatewayStatusResult
            {
                IsSuccess = true,
                Status = MapStatus(latest.Status),
                ResultCode = latest.Status,
                GatewayTransactionId = merchantReference,
                PaymentMethod = "QR",
            };
        }

        public async Task<GatewayStatusResult> HandleNotificationAsync(GatewayNotificationContext context, CancellationToken ct = default)
        {
            EncryptedEnvelope? envelope;
            try
            {
                envelope = JsonSerializer.Deserialize<EncryptedEnvelope>(context.RawBody, JsonOpts);
            }
            catch (JsonException)
            {
                envelope = null;
            }

            if (envelope is null || string.IsNullOrEmpty(envelope.Data))
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(TConnectGateway),
                    "Invalid IPN payload.",
                    ErrorCodes.InvalidPayload
                ));
                return new GatewayStatusResult { IsSuccess = false };
            }

            string decrypted;
            try
            {
                decrypted = EncryptionHelper.AesCbcDecrypt(envelope.Data, _settings.AesKeyHex);
            }
            catch (Exception ex) when (ex is FormatException or System.Security.Cryptography.CryptographicException)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(TConnectGateway),
                    "Failed to decrypt IPN payload.",
                    ErrorCodes.InvalidSignature
                ));
                return new GatewayStatusResult { IsSuccess = false };
            }

            IpnPayload ipn;
            try
            {
                ipn = JsonSerializer.Deserialize<IpnPayload>(decrypted, JsonOpts) ?? throw new JsonException("Empty body.");
            }
            catch (JsonException)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(TConnectGateway),
                    "Invalid IPN payload.",
                    ErrorCodes.InvalidPayload
                ));
                return new GatewayStatusResult { IsSuccess = false };
            }

            return new GatewayStatusResult
            {
                IsSuccess = true,
                Status = TransactionStatus.Succeeded,
                ResultCode = TConnectStatus.Success,
                ResultMessage = ipn.Narrative,
                GatewayTransactionId = ipn.OrderId,
                PaymentMethod = "QR",
            };
        }

        private static TransactionStatus MapStatus(string? status) => status switch
        {
            TConnectStatus.Success => TransactionStatus.Succeeded,
            _ => TransactionStatus.Pending,
        };

        private async Task<TRes?> SendEncryptedAsync<TRes>(string path, object payload, CancellationToken ct)
        {
            string? token = await _tokenProvider.GetAccessTokenAsync(ct);
            if (token is null) return default;

            string encrypted = EncryptionHelper.AesCbcEncrypt(JsonSerializer.Serialize(payload, JsonOpts), _settings.AesKeyHex);

            HttpResponseMessage httpResponse;
            try
            {
                httpResponse = await SendAsync(token, path, encrypted, ct);

                if (httpResponse.StatusCode == HttpStatusCode.Unauthorized)
                {
                    httpResponse.Dispose();
                    await _tokenProvider.InvalidateAsync(ct);

                    token = await _tokenProvider.GetAccessTokenAsync(ct);
                    if (token is null) return default;

                    httpResponse = await SendAsync(token, path, encrypted, ct);
                }
            }
            catch (HttpRequestException)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(TConnectGateway),
                    "Payment provider unavailable.",
                    ErrorCodes.ProviderUnavailable
                ));
                return default;
            }
            catch (TaskCanceledException) when (!ct.IsCancellationRequested)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(TConnectGateway),
                    "Payment provider timed out.",
                    ErrorCodes.ProviderTimeOut
                ));
                return default;
            }

            using (httpResponse)
            {
                if (!httpResponse.IsSuccessStatusCode)
                {
                    await _bus.RaiseEventAsync(new DomainNotification(
                        nameof(TConnectGateway),
                        $"Payment provider rejected the request ({(int)httpResponse.StatusCode}).",
                        ErrorCodes.ProviderUnavailable
                    ));
                    return default;
                }

                return await httpResponse.Content.ReadFromJsonAsync<TRes>(JsonOpts, ct);
            }
        }

        private async Task<HttpResponseMessage> SendAsync(string token, string path, string encryptedData, CancellationToken ct)
        {
            HttpClient client = _http.CreateClient(TConnectSettings.HttpClientName);
            using HttpRequestMessage requestMessage = new HttpRequestMessage(HttpMethod.Post, path)
            {
                Content = JsonContent.Create(new EncryptedEnvelope { Data = encryptedData }, options: JsonOpts),
            };
            requestMessage.Headers.Add("Partner-Code", _settings.PartnerCode);
            requestMessage.Headers.Add("x-service-code", _settings.ServiceCode);
            requestMessage.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            return await client.SendAsync(requestMessage, ct);
        }

        private static string Truncate(string value, int maxLen) =>
            value.Length > maxLen ? value[..maxLen] : value;
    }
}
