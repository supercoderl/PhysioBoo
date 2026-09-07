using Microsoft.Extensions.Options;
using PhysioBoo.Application.Interfaces.Payment;
using PhysioBoo.Application.ViewModels.Payments;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Domain.Settings;
using PhysioBoo.Infrastructure.PaymentGateways.MegaPay.Models;
using PhysioBoo.SharedKernel.Utils;
using System.Globalization;
using System.Net.Http.Json;
using System.Text.Json;

namespace PhysioBoo.Infrastructure.PaymentGateways.MegaPay
{
    internal sealed class MegaPayGateway : IPaymentGateway
    {
        public string ProviderName => "megapay";

        private readonly MegaPaySettings _setting;
        private readonly MegaPayCrypto _crypto;
        private readonly IHttpClientFactory _http;
        private readonly IMediatorHandler _bus;
        private static readonly JsonSerializerOptions JsonOpts = new(JsonSerializerDefaults.Web);

        private const string CreateLinkPath = "/pg_was/createlink.do";
        private const string InquiryPath = "/pg_was/order/trxStatus.do";

        public MegaPayGateway(
            IOptions<MegaPaySettings> options,
            IHttpClientFactory http,
            IMediatorHandler bus
        )
        {
            _setting = options?.Value ?? throw new ArgumentNullException(nameof(options));
            _http = http ?? throw new ArgumentNullException(nameof(http));
            _bus = bus;
            _crypto = new MegaPayCrypto(_setting.EncodeKey);
        }

        public async Task<GatewayCreateResult> CreateAsync(GatewayCreateViewModel request, CancellationToken ct = default)
        {
            string timeStamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString();
            string amountStr = request.Amount.ToString();
            string payType = NormalisePayType(request.PaymentMethod);
            string linkExptime = !string.IsNullOrEmpty(request.ExpiresAt) ? request.ExpiresAt :
                !string.IsNullOrEmpty(_setting.DefaultLinkExpTime) ? _setting.DefaultLinkExpTime :
                TimeZoneHelper.GetLocalTimeNow().AddHours(24).ToString("yyyyMMddHHmmss", CultureInfo.InvariantCulture);
            string token = _crypto.SignCreateLinkRequest(timeStamp, request.InvoiceNo, _setting.MerId, amountStr, linkExptime);

            CreateLinkRequest body = new CreateLinkRequest
            {
                MerId = _setting.MerId,
                Amount = amountStr,
                InvoiceNo = request.InvoiceNo,
                GoodsNm = Sanitise(request.GoodsName),
                PayType = payType,
                CallBackUrl = _setting.CallBackUrl,
                NotiUrl = _setting.NotiUrl,
                ReqDomain = _setting.ReqDomain,
                Descriptions = Sanitise(request.Description ?? request.GoodsName, maxLen: 100),
                MerchantToken = token,
                TimeStamp = timeStamp,
                LinkExptime = linkExptime,
                WindowColor = _setting.WindowColor,
                BuyerFirstNm = request.BuyerFirstName,
                BuyerLastNm = request.BuyerLastName,
                BuyerEmail = request.BuyerEmail,
                BuyerPhone = request.BuyerPhone,
                BankCode = request.BankCode,
            };

            CreateLinkResponse response;
            try
            {
                response = await PostJsonAsync<CreateLinkRequest, CreateLinkResponse>(CreateLinkPath, body, ct);
            }
            catch (HttpRequestException)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(MegaPayGateway),
                    "Payment provider unavailable.",
                    ErrorCodes.ProviderUnavailable
                ));
                return new GatewayCreateResult { IsSuccess = false };
            }
            catch (TaskCanceledException) when (!ct.IsCancellationRequested)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(MegaPayGateway),
                    "Payment provider timed out.",
                    ErrorCodes.ProviderTimeOut
                ));
                return new GatewayCreateResult { IsSuccess = false };
            }

            if (response.ResultCd != ResultCode.Success)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(MegaPayGateway),
                    response.ResultMsg ?? "Payment provider rejected the request.",
                    response.ResultCd
                ));
                return new GatewayCreateResult { IsSuccess = false };
            }

            if (!string.IsNullOrEmpty(response.MerchantToken))
            {
                bool valid = _crypto.VerifyCreateLinkResponse(
                    response.MerchantToken,
                    response.ResultCd ?? "",
                    response.TimeStamp ?? "",
                    response.MerId ?? "",
                    response.InvoiceNo ?? "",
                    response.Amount ?? "",
                    response.PayType ?? "",
                    response.PayOption,
                    response.LinkExptime,
                    response.PaymentLinkEncrypted,
                response.QrCode);

                if (!valid)
                {
                    await _bus.RaiseEventAsync(new DomainNotification(
                        nameof(MegaPayGateway),
                        "Payment provider response could not be verified.",
                        ErrorCodes.InvalidSignature
                    ));
                    return new GatewayCreateResult { IsSuccess = false };
                }
            }

            string paymentUrl = string.Empty;
            if (!string.IsNullOrEmpty(response.PaymentLinkEncrypted))
            {
                try { paymentUrl = _crypto.DecryptPaymentLink(response.PaymentLinkEncrypted); }
                catch (Exception)
                {
                    await _bus.RaiseEventAsync(new DomainNotification(
                        nameof(MegaPayGateway),
                        "Failed to process payment link.",
                        "DECRYPTION_ERROR"
                    ));
                    return new GatewayCreateResult { IsSuccess = false };
                }
            }

            return new GatewayCreateResult
            {
                IsSuccess = true,
                GatewayTransactionId = response.InvoiceNo ?? request.InvoiceNo,
                PaymentUrl = paymentUrl,
                QrCode = response.QrCode,
                ExpiresAt = response.LinkExptime
            };
        }

        public async Task<GatewayStatusResult> HandleNotificationAsync(GatewayNotificationContext context, CancellationToken ct = default)
        {
            IpnPayload ipn;
            try
            {
                ipn = JsonSerializer.Deserialize<IpnPayload>(context.RawBody, JsonOpts) ?? throw new JsonException("Empty body.");
            }
            catch (JsonException)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(MegaPayGateway),
                    "Invalid IPN payload.",
                    ErrorCodes.InvalidPayload
                ));
                return new GatewayStatusResult { IsSuccess = false };
            }

            bool valid = _crypto.VerifyResponseToken(
                ipn.MerchantToken,
                ipn.ResultCd, ipn.TimeStamp,
                ipn.MerTrxId, ipn.TrxId,
            ipn.MerId, ipn.Amount, ipn.UserFee);

            if (!valid)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(MegaPayGateway),
                    "Invalid IPN signature.",
                    ErrorCodes.InvalidSignature
                ));
                return new GatewayStatusResult() { IsSuccess = false };
            }

            GatewayStatusResult inquiryResult = await QueryStatusAsync(ipn.MerTrxId, ct);
            if (inquiryResult.IsSuccess)
                return inquiryResult;

            return MapIpnToStatus(ipn);
        }

        public async Task<GatewayStatusResult> QueryStatusAsync(string merchantReference, CancellationToken ct = default)
        {
            string timeStamp = TimeZoneHelper.ToUnixTimeMilliseconds(TimeZoneHelper.GetLocalTimeNow()).ToString();
            string token = _crypto.SignInquiryRequest(timeStamp, merchantReference, _setting.MerId);

            FormUrlEncodedContent form = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["merId"] = _setting.MerId,
                ["merTrxId"] = merchantReference,
                ["merchantToken"] = token,
                ["timeStamp"] = timeStamp,
            });

            InquiryResponse inquiry;
            try
            {
                HttpClient client = _http.CreateClient(MegaPaySettings.HttpClientName);
                using HttpResponseMessage resp = await client.PostAsync(InquiryPath, form, ct);
                resp.EnsureSuccessStatusCode();
                inquiry = await resp.Content.ReadFromJsonAsync<InquiryResponse>(JsonOpts, ct) ?? throw new InvalidOperationException("Empty inquiry response.");
            }
            catch (HttpRequestException)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(MegaPayGateway),
                    "Inquiry network error.",
                    ErrorCodes.InquiryNetworkError
                ));
                return new GatewayStatusResult { IsSuccess = false };
            }
            catch (TaskCanceledException) when (!ct.IsCancellationRequested)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(MegaPayGateway),
                    "Inquiry timed out.",
                    ErrorCodes.InquiryTimeOut
                ));
                return new GatewayStatusResult { IsSuccess = false };
            }

            if (inquiry.ResultCd != ResultCode.Success)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(MegaPayGateway),
                    inquiry.ResultMsg ?? "Inquiry failed.",
                    inquiry.ResultCd
                ));
                return new GatewayStatusResult { IsSuccess = false };
            }

            InquiryData? data = inquiry.Data;
            if (data is null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(MegaPayGateway),
                    "Inquiry returned no data.",
                    "INQUIRY_EMPTY"
                ));
                return new GatewayStatusResult { IsSuccess = false };
            }

            if (!string.IsNullOrEmpty(data.MerchantToken) && !string.IsNullOrEmpty(data.TrxId))
            {
                bool valid = _crypto.VerifyResponseToken(
                    data.MerchantToken,
                    data.ResultCd ?? "", data.TimeStamp ?? "",
                    data.MerTrxId ?? "", data.TrxId,
                    data.MerId ?? "", data.Amount ?? "", data.UserFee);

                if (!valid)
                {
                    await _bus.RaiseEventAsync(new DomainNotification(
                        nameof(MegaPayGateway),
                        "Inquiry response signature invalid.",
                        ErrorCodes.InvalidSignature
                    ));
                    return new GatewayStatusResult { IsSuccess = false };
                }
            }

            return MapInquiryToStatus(data);
        }

        private static GatewayStatusResult MapInquiryToStatus(InquiryData data)
        {
            TransactionStatus status = (data.Status, data.TwoStepStatus) switch
            {
                (InquiryStatus.Success, null) => TransactionStatus.Succeeded,
                (InquiryStatus.Success, TwoStepStatus.Authorized) => TransactionStatus.Authorized,
                (InquiryStatus.Success, TwoStepStatus.Captured) => TransactionStatus.Succeeded,
                (InquiryStatus.Success, TwoStepStatus.AuthorizationCancelled) => TransactionStatus.Cancelled,
                (InquiryStatus.Success, TwoStepStatus.CaptureRejected) => TransactionStatus.Failed,
                (InquiryStatus.InstallmentCancelled, _) => TransactionStatus.Cancelled,
                (InquiryStatus.Refunded, _) => TransactionStatus.Refunded,
                (InquiryStatus.DepositCodePending, _) => TransactionStatus.AwaitingDeposit,
                (InquiryStatus.Pending, _) => TransactionStatus.Pending,
                (InquiryStatus.Failed, _) => TransactionStatus.Failed,
                _ => TransactionStatus.Pending,
            };

            return new GatewayStatusResult
            {
                IsSuccess = true,
                Status = status,
                ResultCode = data.ResultCd ?? "",
                ResultMessage = data.ResultMsg,
                GatewayTransactionId = data.MerTrxId,
                PaymentMethod = data.PayType,
                BankCode = data.BankId,
            };
        }

        private static GatewayStatusResult MapIpnToStatus(IpnPayload ipn)
        {
            TransactionStatus status = ipn.ResultCd switch
            {
                ResultCode.Success => TransactionStatus.Succeeded,
                ResultCode.DepositCodePendingDeposit => TransactionStatus.AwaitingDeposit,
                ResultCode.Pending => TransactionStatus.Pending,
                ResultCode.CustomerCancelled => TransactionStatus.Cancelled,
                _ => TransactionStatus.Failed,
            };

            return new GatewayStatusResult
            {
                IsSuccess = true,
                Status = status,
                ResultCode = ipn.ResultCd,
                ResultMessage = ipn.ResultMsg,
                GatewayTransactionId = ipn.MerTrxId,
                PaymentMethod = ipn.PayType,
                BankCode = ipn.BankId,
            };
        }

        private static string NormalisePayType(string? method) =>
            string.IsNullOrWhiteSpace(method) ? "NO" : method.ToUpperInvariant();

        private static string Sanitise(string? input, int maxLen = 200)
        {
            if (string.IsNullOrEmpty(input)) return "Payment";
            string clean = string.Concat(
                input.Replace("\r", "").Replace("\n", "")
                     .Where(c => !"!@#$%&*<=>?^'|\"".Contains(c)));
            return clean.Length > maxLen ? clean[..maxLen] : clean;
        }

        private async Task<TRes> PostJsonAsync<TReq, TRes>(string path, TReq body, CancellationToken ct)
        {
            HttpClient client = _http.CreateClient(MegaPaySettings.HttpClientName);
            using HttpResponseMessage response = await client.PostAsJsonAsync(path, body, JsonOpts, ct);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<TRes>(JsonOpts, ct) ?? throw new InvalidOperationException($"Empty response from {path}.");
        }
    }
}
