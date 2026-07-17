using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PhysioBoo.Application.Interfaces;
using PhysioBoo.Application.ViewModels.Roles;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Shared.Events.Roles;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.EventHandlers.Role
{
    public sealed class RoleEventHandler :
        INotificationHandler<RoleCreatedEvent>,
        INotificationHandler<RoleDeletedEvent>,
        INotificationHandler<RoleUpdatedEvent>
    {
        private readonly ICacheService _cacheService;
        private readonly IRoleRepository _roleRepository;
        private readonly ILogger<RoleEventHandler> _logger;
        private readonly ICacheRefreshGate _gate;

        public RoleEventHandler(
            ICacheService cacheService,
            IRoleRepository roleRepository,
            ILogger<RoleEventHandler> logger,
            ICacheRefreshGate gate
        )
        {
            _cacheService = cacheService;
            _roleRepository = roleRepository;
            _logger = logger;
            _gate = gate;
        }

        public Task Handle(RoleCreatedEvent notification, CancellationToken cancellationToken) => RefreshAsync(cancellationToken);

        public Task Handle(RoleDeletedEvent notification, CancellationToken cancellationToken) => RefreshAsync(cancellationToken);

        public Task Handle(RoleUpdatedEvent notification, CancellationToken cancellationToken) => RefreshAsync(cancellationToken);

        private Task RefreshAsync(CancellationToken cancellationToken) => _gate.TryRefreshAsync(
            key: CacheKeys.Roles,
            refresh: async () =>
            {
                List<RoleCacheViewModel> roles = await _roleRepository.GetAllNoTracking(filter: x => x.IsActive && x.IsPublicForRegistration)
                    .Select(x => new RoleCacheViewModel(x.Id, x.Name)).ToListAsync(cancellationToken);

                await _cacheService.SetAsync(CacheKeys.Roles, roles, TimeSpan.FromHours(1), cancellationToken);
            },
            cancellationToken
        );
    }
}
