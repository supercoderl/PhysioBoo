using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Roles.DeleteRole
{
    public sealed class DeleteRoleCommandHandler : CommandHandlerBase, IRequestHandler<DeleteRoleCommand>
    {
        private readonly IRoleRepository _roleRepository;

        public DeleteRoleCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IRoleRepository roleRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _roleRepository = roleRepository;
        }

        public async Task Handle(DeleteRoleCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Core.Role? role = await _roleRepository.GetByIdAsync(request.Id);

            if (role == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Role not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            _roleRepository.SoftDeleteSingle(
                role,
                request.IsHard,
                cancellationToken
            );

            await CommitAsync();
        }
    }
}