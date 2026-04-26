using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.AdminMenus.UpdateAdminMenu
{
    public sealed class UpdateAdminMenuCommandHandler : CommandHandlerBase, IRequestHandler<UpdateAdminMenuCommand>
    {
        private readonly IAdminMenuRepository _adminMenuRepository;

        public UpdateAdminMenuCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IAdminMenuRepository adminMenuRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _adminMenuRepository = adminMenuRepository;
        }

        public async Task Handle(UpdateAdminMenuCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Core.AdminMenu? adminMenu = await _adminMenuRepository.GetByIdAsync(request.Id);

            if (adminMenu == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Admin menu with Id {request.Id} not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            adminMenu.SetLabel(request.AdminMenu.Label);
            adminMenu.SetIcon(request.AdminMenu.Icon);
            adminMenu.SetRoute(request.AdminMenu.Route);
            adminMenu.SetParentId(request.AdminMenu.ParentId);
            adminMenu.SetOrder(request.AdminMenu.Order);
            adminMenu.SetPermissionCode(request.AdminMenu.PermissionCode);
            adminMenu.SetIsActive(request.AdminMenu.IsActive);

            await _adminMenuRepository.UpdateTrackedAsync(adminMenu, cancellationToken);
        }
    }
}