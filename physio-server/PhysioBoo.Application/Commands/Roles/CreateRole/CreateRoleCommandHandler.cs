using MediatR;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.Roles.CreateRole
{
    public sealed class CreateRoleCommandHandler : CommandHandlerBase, IRequestHandler<CreateRoleCommand>
    {
        private readonly IRoleRepository _RoleRepository;

        public CreateRoleCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IRoleRepository roleRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _RoleRepository = roleRepository;
        }

        public async Task Handle(CreateRoleCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            SharedKernel.Results.DbResult<Guid> result = await _RoleRepository.InsertAsync<Role, Guid>(new Role(
                request.NewRole.Id,
                request.NewRole.Name,
                request.NewRole.Code,
                request.NewRole.Description,
                request.NewRole.Color,
                request.NewRole.Icon,
                false,
                false
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
