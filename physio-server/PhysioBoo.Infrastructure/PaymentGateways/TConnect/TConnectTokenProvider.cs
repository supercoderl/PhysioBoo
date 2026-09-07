using Microsoft.Extensions.Options;
using PhysioBoo.Application.Interfaces;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Domain.Settings;
using PhysioBoo.Infrastructure.PaymentGateways.TConnect.Models;
using PhysioBoo.SharedKernel.Utils;
using System.Net.Http.Json;
using System.Text.Json;

namespace PhysioBoo.Infrastructure.PaymentGateways.TConnect
{
    internal sealed record CachedAccessToken(string AccessToken, int ExpiresIn);

    /// <summary>
    /// Logs in to TConnect and caches the access token so requests reuse it instead of
    /// re-authenticating on every call. Internal to this gateway.
    /// </summary>
    internal sealed class TConnectTokenProvider
    {
        private const string CacheKey = "tconnect:access_token";
        private const string LoginPath = "/openapi/v1/auth/login";
        private const int ExpiryBufferSeconds = 60;

        private readonly TConnectSettings _settings;
        private readonly IHttpClientFactory _http;
        private readonly ICacheService _cache;
        private readonly IMediatorHandler _bus;
        private static readonly JsonSerializerOptions JsonOpts = new(JsonSerializerDefaults.Web);

        public TConnectTokenProvider(
            IOptions<TConnectSettings> options,
            IHttpClientFactory http,
            ICacheService cache,
            IMediatorHandler bus)
        {
            _settings = options?.Value ?? throw new ArgumentNullException(nameof(options));
            _http = http;
            _cache = cache;
            _bus = bus;
        }

        internal async Task<string?> GetAccessTokenAsync(CancellationToken ct)
        {
            CachedAccessToken? cached = await _cache.GetAsync<CachedAccessToken>(CacheKey, ct);
            if (cached is not null) return cached.AccessToken;

            return await LoginAndCacheAsync(ct);
        }

        internal Task InvalidateAsync(CancellationToken ct) => _cache.RemoveAsync(CacheKey, ct);

        private async Task<string?> LoginAndCacheAsync(CancellationToken ct)
        {
            LoginPayload payload = new LoginPayload
            {
                Username = _settings.Username,
                Password = _settings.Password,
                ClientId = _settings.ClientId,
                ClientSecret = _settings.ClientSecret,
            };

            string encrypted = EncryptionHelper.AesCbcEncrypt(JsonSerializer.Serialize(payload, JsonOpts), _settings.AesKeyHex);

            LoginResponse? response;
            try
            {
                HttpClient client = _http.CreateClient(TConnectSettings.HttpClientName);
                using HttpRequestMessage requestMessage = new HttpRequestMessage(HttpMethod.Post, LoginPath)
                {
                    Content = JsonContent.Create(new EncryptedEnvelope { Data = encrypted }, options: JsonOpts),
                };
                requestMessage.Headers.Add("Partner-Code", _settings.PartnerCode);

                using HttpResponseMessage httpResponse = await client.SendAsync(requestMessage, ct);
                if (!httpResponse.IsSuccessStatusCode)
                {
                    await _bus.RaiseEventAsync(new DomainNotification(
                        nameof(TConnectTokenProvider),
                        "TConnect authentication was rejected.",
                        ErrorCodes.AuthenticationFailed
                    ));
                    return null;
                }

                response = await httpResponse.Content.ReadFromJsonAsync<LoginResponse>(JsonOpts, ct);
            }
            catch (HttpRequestException)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(TConnectTokenProvider),
                    "Payment provider unavailable.",
                    ErrorCodes.ProviderUnavailable
                ));
                return null;
            }
            catch (TaskCanceledException) when (!ct.IsCancellationRequested)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(TConnectTokenProvider),
                    "Payment provider timed out.",
                    ErrorCodes.ProviderTimeOut
                ));
                return null;
            }

            if (string.IsNullOrEmpty(response?.AccessToken))
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(TConnectTokenProvider),
                    "TConnect login response was missing an access token.",
                    ErrorCodes.AuthenticationFailed
                ));
                return null;
            }

            int cacheSeconds = Math.Max(response.ExpiresIn - ExpiryBufferSeconds, ExpiryBufferSeconds);
            await _cache.SetAsync(CacheKey, new CachedAccessToken(response.AccessToken, response.ExpiresIn), TimeSpan.FromSeconds(cacheSeconds), ct);

            return response.AccessToken;
        }
    }
}
