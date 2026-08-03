using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Shared.Events.Roles;

namespace PhysioBoo.Application.Commands.Roles.UpdateRole
{
    public sealed class UpdateRoleCommandHandler : CommandHandlerBase, IRequestHandler<UpdateRoleCommand>
    {
        private readonly IRoleRepository _roleRepository;

        public UpdateRoleCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IRoleRepository roleRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _roleRepository = roleRepository;
        }

        public async Task Handle(UpdateRoleCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Core.Role? role = await _roleRepository.GetByIdAsync(request.Id);

            if (role == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Role with Id {request.Id} not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            role.SetName(request.Role.Name);
            role.SetCode(request.Role.Code);
            role.SetDescription(request.Role.Description);

            int executedNum = await _roleRepository.UpdateTrackedAsync(role, ct);

            if (executedNum > 0)
            {
                await Bus.RaiseEventAsync(new RoleUpdatedEvent(request.Id));
            }
        }
    }
}