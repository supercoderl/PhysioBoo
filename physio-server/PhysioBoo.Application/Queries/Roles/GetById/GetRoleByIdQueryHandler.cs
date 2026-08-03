using MediatR;
using PhysioBoo.Application.ViewModels.Roles;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Queries.Roles.GetById
{
    public sealed class GetRoleByIdQueryHandler : IRequestHandler<GetRoleByIdQuery, RoleViewModel?>
    {
        private readonly IMediatorHandler _bus;
        private readonly IRoleRepository _roleRepository;

        public GetRoleByIdQueryHandler(
            IMediatorHandler bus,
            IRoleRepository roleRepository
        )
        {
            _bus = bus;
            _roleRepository = roleRepository;
        }

        public async Task<RoleViewModel?> Handle(GetRoleByIdQuery request, CancellationToken ct)
        {
            Role? role = await _roleRepository.GetByIdAsync(request.Id, ct: ct);

            if (role == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetRoleByIdQuery),
                    $"Role with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));

                return null;
            }

            return RoleViewModel.FromRole(role);
        }
    }
}
