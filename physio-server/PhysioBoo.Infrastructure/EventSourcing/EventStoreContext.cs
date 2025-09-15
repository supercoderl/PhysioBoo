﻿using Microsoft.AspNetCore.Http;
using PhysioBoo.Domain.Interfaces;

namespace PhysioBoo.Infrastructure.EventSourcing
{
    public sealed class EventStoreContext : IEventStoreContext
    {
        private readonly string _correlationId;
        private readonly IUser? _user;

        public EventStoreContext(IUser? user, IHttpContextAccessor? httpContextAccessor)
        {
            _user = user;

            if (httpContextAccessor?.HttpContext is null ||
                !httpContextAccessor.HttpContext.Request.Headers.TryGetValue("X-CLEAN-ARCHITECTURE-CORRELATION-ID",
                    out var id))
            {
                _correlationId = $"internal - {Guid.NewGuid()}";
            }
            else
            {
                _correlationId = id.ToString();
            }
        }

        public string GetCorrelationId() => _correlationId;

        public string GetUserEmail() => _user?.GetUserEmail() ?? string.Empty;
    }
}
