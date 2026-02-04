using Microsoft.Extensions.Caching.Distributed;
using PhysioBoo.Presentation.Extensions;
using System.Security.Claims;

namespace PhysioBoo.Presentation.Middlewares
{
    public sealed class SecurityGuardMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IDistributedCache _cache;
        private readonly ILogger<SecurityGuardMiddleware> _logger;

        public SecurityGuardMiddleware(
            RequestDelegate next,
            IDistributedCache cache,
            ILogger<SecurityGuardMiddleware> logger
        )
        {
            _next = next;
            _cache = cache;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            string clientIp = context.GetClientIpAddress();
            string blacklistKey = $"security:blacklist:{clientIp}";
            string? isBlacklisted = await _cache.GetStringAsync(blacklistKey);

            if (!string.IsNullOrEmpty(isBlacklisted))
            {
                _logger.LogWarning("Blocked access from blacklisted IP: {Ip}", clientIp);

                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                await context.Response.WriteAsJsonAsync(new
                {
                    success = false,
                    message = "Access denied. Your IP address has been blocked due to suspicious activity."
                });
                return;
            }

            if (context.Request.Path.StartsWithSegments("/api/admin"))
            {
                string whitelistKey = $"security:whitelist:{clientIp}";
                string? isWhitelisted = await _cache.GetStringAsync(whitelistKey);
                if (string.IsNullOrEmpty(isWhitelisted))
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    await context.Response.WriteAsJsonAsync(new { success = false, message = "Access denied. Your IP address cannot access to admin page." });
                    return;
                }
            }

            if (context.User.Identity?.IsAuthenticated == true)
            {
                string? userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId != null)
                {
                    string? isBanned = await _cache.GetStringAsync($"ban_user_{userId}");
                    if (!string.IsNullOrEmpty(isBanned))
                    {
                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        await context.Response.WriteAsJsonAsync(new { success = false, message = "Account has been banned." });
                        return;
                    }
                }
            }

            await _next(context);
        }
    }
}
