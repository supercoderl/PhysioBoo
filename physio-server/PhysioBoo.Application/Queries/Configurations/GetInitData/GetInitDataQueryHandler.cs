using MediatR;
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Configurations;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Configurations.GetInitData
{
    public sealed class GetInitDataQueryHandler : IRequestHandler<GetInitDataQuery, InitDataViewModel>
    {
        private readonly IRoleRepository _roleRepository;

        public GetInitDataQueryHandler(
            IRoleRepository roleRepository
        )
        {
            _roleRepository = roleRepository;
        }

        public async Task<InitDataViewModel> Handle(GetInitDataQuery req, CancellationToken cancellationToken)
        {
            List<Role> roles = await _roleRepository.GetAllNoTracking(
                filter: role => role.IsPublicForRegistration
            ).ToListAsync();

            // Map to view model
            return InitDataViewModel.FromConfig(roles);
        }
    }
}
