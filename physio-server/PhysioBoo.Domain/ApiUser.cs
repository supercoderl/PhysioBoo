using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using PhysioBoo.Domain.Exceptions;
using PhysioBoo.Domain.Interfaces;
using System.Security.Claims;

namespace PhysioBoo.Domain
{
    public sealed class ApiUser : IUser
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<ApiUser> _logger;
        private string? _name;
        private string? _timeZoneId;
        private Guid _userId = Guid.Empty;
        private Guid _tenantId = Guid.Empty;

        public ApiUser(IHttpContextAccessor httpContextAccessor, ILogger<ApiUser> logger)
        {
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        public Guid GetUserId()
        {
            if (_userId != Guid.Empty)
            {
                return _userId;
            }

            Claim? claim = _httpContextAccessor.HttpContext?.User.Claims
            .FirstOrDefault(x => string.Equals(x.Type, ClaimTypes.NameIdentifier));

            if (claim is null)
            {
                throw new UnauthenticatedException("The user has not logged in yet.");
            }

            if (!Guid.TryParse(claim.Value, out Guid userId))
            {
                _logger.LogWarning("NameIdentifier claim '{ClaimValue}' is not a valid user id.", claim.Value);
                throw new UnauthenticatedException("The user identity is invalid.");
            }

            _userId = userId;
            return userId;
        }

        public string GetUserRole()
        {
            Claim? claim = _httpContextAccessor.HttpContext?.User.Claims
                .FirstOrDefault(x => string.Equals(x.Type, ClaimTypes.Role));

            if (claim != null && !string.IsNullOrEmpty(claim.Value))
            {
                return claim.Value;
            }

            throw new UnauthenticatedException("The user has not logged in yet.");
        }

        public string Name
        {
            get
            {
                if (_name is not null)
                {
                    return _name;
                }

                System.Security.Principal.IIdentity? identity = _httpContextAccessor.HttpContext?.User.Identity;
                if (identity is null)
                {
                    _name = string.Empty;
                    return string.Empty;
                }

                if (!string.IsNullOrWhiteSpace(identity.Name))
                {
                    _name = identity.Name;
                    return identity.Name;
                }

                string? claim = _httpContextAccessor.HttpContext!.User.Claims
                    .FirstOrDefault(c => string.Equals(c.Type, ClaimTypes.Name, StringComparison.OrdinalIgnoreCase))?
                    .Value;
                _name = claim ?? string.Empty;
                return _name;
            }
        }

        public string? TimeZoneId
        {
            get
            {
                if (_timeZoneId is not null)
                {
                    return _timeZoneId;
                }

                _timeZoneId = _httpContextAccessor.HttpContext?.User.FindFirst("tz")?.Value ?? "UTC";

                return _timeZoneId;
            }
        }

        public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User.Identity?.IsAuthenticated ?? false;

        public string GetUserEmail()
        {
            Claim? claim = _httpContextAccessor.HttpContext?.User.Claims
                .FirstOrDefault(x => string.Equals(x.Type, ClaimTypes.Email));

            if (!string.IsNullOrWhiteSpace(claim?.Value))
            {
                return claim.Value;
            }

            return string.Empty;
        }

        public Guid GetTenantId()
        {
            if (_tenantId != Guid.Empty)
            {
                return _tenantId;
            }

            Claim? claim = _httpContextAccessor.HttpContext?.User.Claims
            .FirstOrDefault(x => string.Equals(x.Type, "TenantId"));

            if (claim is null)
            {
                throw new UnauthenticatedException("The user has not logged in yet.");
            }

            if (!Guid.TryParse(claim.Value, out Guid tenantId))
            {
                _logger.LogWarning("TenantId claim '{ClaimValue}' is not a valid tenant id.", claim.Value);
                throw new UnauthenticatedException("The user identity is invalid.");
            }

            _tenantId = tenantId;
            return tenantId;
        }
    }
}
