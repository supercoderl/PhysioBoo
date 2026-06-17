using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Permissions.DeletePermission
{
    public sealed class DeletePermissionCommandHandler : CommandHandlerBase, IRequestHandler<DeletePermissionCommand>
    {
        private readonly IPermissionRepository _permissionRepository;

        public DeletePermissionCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IPermissionRepository permissionRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _permissionRepository = permissionRepository;
        }

        public async Task Handle(DeletePermissionCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Core.Permission? permission = await _permissionRepository.GetByIdAsync(request.Id);

            if (permission == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Permission not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            _permissionRepository.SoftDeleteSingle(
                permission,
                request.IsHard,
                cancellationToken
            );

            await CommitAsync();
        }
    }
}