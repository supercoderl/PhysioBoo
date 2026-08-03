using MediatR;
using Microsoft.Extensions.Caching.Distributed;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.SharedKernel.Utils;
using System.Text.Json;

namespace PhysioBoo.Application.Commands.Systems.Ip
{
    public sealed class SecurityCommandHandler : CommandHandlerBase, IRequestHandler<BlockIpCommand>, IRequestHandler<UnblockIpCommand>
    {
        private readonly IDistributedCache _cache;

        public SecurityCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IDistributedCache cache
        ) : base(bus, unitOfWork, notifications)
        {
            _cache = cache;
        }

        public async Task Handle(BlockIpCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            string key = $"security:blacklist:{request.IpAddress}";
            var data = new
            {
                Reason = request.Reason,
                BlockedAt = TimeZoneHelper.GetLocalTimeNow(),
                BlockedBy = "SystemAdmin"
            };

            DistributedCacheEntryOptions options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(request.DurationMinutes)
            };

            await _cache.SetStringAsync(key, JsonSerializer.Serialize(data), options, ct);
        }

        public async Task Handle(UnblockIpCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            string key = $"security:blacklist:{request.IpAddress}";
            await _cache.RemoveAsync(key, ct);
        }
    }
}
