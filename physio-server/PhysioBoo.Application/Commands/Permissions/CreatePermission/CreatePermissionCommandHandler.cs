using MediatR;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Permissions.CreatePermission
{
    public sealed class CreatePermissionCommandHandler : CommandHandlerBase, IRequestHandler<CreatePermissionCommand>
    {
        private readonly IPermissionRepository _PermissionRepository;

        public CreatePermissionCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IPermissionRepository PermissionRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _PermissionRepository = PermissionRepository;
        }

        public async Task Handle(CreatePermissionCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            SharedKernel.Results.DbResult<Guid> result = await _PermissionRepository.InsertAsync<Permission, Guid>(new Permission(
                request.NewPermission.Id,
                request.NewPermission.Name,
                request.NewPermission.Code,
                request.NewPermission.Description
            ));

            if (!result.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Insert failed, please try again. Error: {result.Error}",
                    ErrorCodes.CommitFailed
                ));

                return;
            }
        }
    }
}
