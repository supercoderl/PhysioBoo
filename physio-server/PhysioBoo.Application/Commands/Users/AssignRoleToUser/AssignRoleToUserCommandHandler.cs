using MediatR;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using System.Text.Json;

namespace PhysioBoo.Application.Commands.Users.AssignRoleToUser
{
    public sealed class AssignRoleToUserCommandHandler : CommandHandlerBase, IRequestHandler<AssignRoleToUserCommand>
    {
        private readonly IUserRoleRepository _userRoleRepository;

        public AssignRoleToUserCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IUserRoleRepository userRoleRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _userRoleRepository = userRoleRepository;
        }

        public async Task Handle(AssignRoleToUserCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            string perJson = JsonSerializer.Serialize(request.RoleForAssigning.Roles.Select(x => new
            {
                code = x.Key,
                isChecked = x.Value
            }));

            await _userRoleRepository.AssignRolesAsync(request.RoleForAssigning.UserId, perJson);
        }
    }
}
