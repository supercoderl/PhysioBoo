using MediatR;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Users.AssignRoleToUserUsingRoleId
{
    public sealed class AssignRoleToUserUsingRoleIdCommandHandler : CommandHandlerBase, IRequestHandler<AssignRoleToUserUsingRoleIdCommand>
    {
        private readonly IUserRoleRepository _userRoleRepository;

        public AssignRoleToUserUsingRoleIdCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IUserRoleRepository userRoleRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _userRoleRepository = userRoleRepository;
        }

        public async Task Handle(AssignRoleToUserUsingRoleIdCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;


            await _userRoleRepository.InsertAsync<UserRole, Guid>(
                new UserRole(
                    Guid.NewGuid(),
                    request.UserId,
                    request.RoleId,
                    request.UserId
                ));
        }
    }
}
