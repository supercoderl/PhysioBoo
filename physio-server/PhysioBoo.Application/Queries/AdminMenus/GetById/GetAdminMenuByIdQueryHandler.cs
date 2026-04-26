using MediatR;
using PhysioBoo.Application.ViewModels.AdminMenus;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.Domain.Notifications;

namespace PhysioBoo.Application.Queries.AdminMenus.GetById
{
    public sealed class GetAdminMenuByIdQueryHandler : IRequestHandler<GetAdminMenuByIdQuery, AdminMenuViewModel?>
    {
        private readonly IMediatorHandler _bus;
        private readonly IAdminMenuRepository _adminMenuRepository;

        public GetAdminMenuByIdQueryHandler(
            IMediatorHandler bus,
            IAdminMenuRepository adminMenuRepository
        )
        {
            _bus = bus;
            _adminMenuRepository = adminMenuRepository;
        }

        public async Task<AdminMenuViewModel?> Handle(GetAdminMenuByIdQuery request, CancellationToken cancellationToken)
        {
            AdminMenu? adminMenu = await _adminMenuRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken);

            if (adminMenu == null)
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetAdminMenuByIdQuery),
                    $"Admin menu with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));

                return null;
            }

            return AdminMenuViewModel.FromAdminMenu(adminMenu);
        }
    }
}
