using MediatR;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Commands.AdminMenus.DeleteAdminMenu
{
    public sealed class DeleteAdminMenuCommandHandler : CommandHandlerBase, IRequestHandler<DeleteAdminMenuCommand>
    {
        private readonly IAdminMenuRepository _adminMenuRepository;

        public DeleteAdminMenuCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IAdminMenuRepository adminMenuRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _adminMenuRepository = adminMenuRepository;
        }

        public async Task Handle(DeleteAdminMenuCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            Domain.Entities.Core.AdminMenu? adminMenu = await _adminMenuRepository.GetByIdAsync(request.Id);

            if (adminMenu == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "Admin menu not found.",
                    ErrorCodes.ObjectNotFound
                ));

                return;
            }

            _adminMenuRepository.SoftDeleteSingle(
                adminMenu,
                request.IsHard,
                ct
            );

            await CommitAsync();
        }
    }
}