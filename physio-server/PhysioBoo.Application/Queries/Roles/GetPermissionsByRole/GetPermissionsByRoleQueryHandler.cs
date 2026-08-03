using MediatR;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Roles.GetPermissionsByRole
{
    public sealed class GetPermissionsByRoleQueryHandler : IRequestHandler<GetPermissionsByRoleQuery, IEnumerable<string>>
    {
        private readonly IMediatorHandler _bus;
        private readonly IRoleRepository _roleRepository;

        public GetPermissionsByRoleQueryHandler(
            IMediatorHandler bus,
            IRoleRepository roleRepository
        )
        {
            _bus = bus;
            _roleRepository = roleRepository;
        }

        public async Task<IEnumerable<string>> Handle(GetPermissionsByRoleQuery request, CancellationToken ct)
        {
            return await _roleRepository.GetPermissionIdsByRoleAsync(request.Id, ct: ct);
        }
    }
}
