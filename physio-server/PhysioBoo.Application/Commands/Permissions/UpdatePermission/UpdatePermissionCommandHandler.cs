using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Permissions.UpdatePermission
{
    public sealed class UpdatePermissionCommandHandler : CommandHandlerBase, IRequestHandler<UpdatePermissionCommand>
    {
        private readonly IPermissionRepository _permissionRepository;

        public UpdatePermissionCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IPermissionRepository permissionRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _permissionRepository = permissionRepository;
        }

        public async Task Handle(UpdatePermissionCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Core.Permission? permission = await _permissionRepository.GetByIdAsync(request.Id);

            if (permission == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Permission with Id {request.Id} not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            permission.SetName(request.Permission.Name);
            permission.SetCode(request.Permission.Code);
            permission.SetDescription(request.Permission.Description);

            await _permissionRepository.UpdateTrackedAsync(permission, cancellationToken);
        }
    }
}