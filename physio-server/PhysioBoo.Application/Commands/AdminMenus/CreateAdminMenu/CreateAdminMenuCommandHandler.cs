using MediatR;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.AdminMenus.CreateAdminMenu
{
    public sealed class CreateAdminMenuCommandHandler : CommandHandlerBase, IRequestHandler<CreateAdminMenuCommand>
    {
        private readonly IAdminMenuRepository _adminMenuRepository;

        public CreateAdminMenuCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IAdminMenuRepository AdminMenuRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _adminMenuRepository = AdminMenuRepository;
        }

        public async Task Handle(CreateAdminMenuCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            AdminMenu adminMenu = new AdminMenu(
                request.NewId,
                request.NewAdminMenu.Label,
                request.NewAdminMenu.Icon,
                request.NewAdminMenu.Route,
                request.NewAdminMenu.ParentId,
                request.NewAdminMenu.Order,
                request.NewAdminMenu.PermissionCode
            );

            SharedKernel.Results.DbResult<Guid> result = await _adminMenuRepository.InsertAsync<AdminMenu, Guid>(adminMenu);

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