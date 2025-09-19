using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using PhysioBoo.Domain.Enums;
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

            var claim = _httpContextAccessor.HttpContext?.User.Claims
            .FirstOrDefault(x => string.Equals(x.Type, ClaimTypes.NameIdentifier));

            if (Guid.TryParse(claim?.Value, out var userId))
            {
                _userId = userId;
                return userId;
            }

            _logger.LogWarning("Could not parse user id to guid");
            return Guid.Empty;
        }

        public Role GetUserRole()
        {
            var claim = _httpContextAccessor.HttpContext?.User.Claims
                .FirstOrDefault(x => string.Equals(x.Type, ClaimTypes.Role));

            if (Enum.TryParse(claim?.Value, out Role userRole))
            {
                return userRole;
            }

            throw new ArgumentException("Could not parse user role");
        }

        public string Name
        {
            get
            {
                if (_name is not null)
                {
                    return _name;
                }

                var identity = _httpContextAccessor.HttpContext?.User.Identity;
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

                var claim = _httpContextAccessor.HttpContext!.User.Claims
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

        public string GetUserEmail()
        {
            var claim = _httpContextAccessor.HttpContext?.User.Claims
                .FirstOrDefault(x => string.Equals(x.Type, ClaimTypes.Email));

            if (!string.IsNullOrWhiteSpace(claim?.Value))
            {
                return claim.Value;
            }

            return string.Empty;
        }
    }
}
