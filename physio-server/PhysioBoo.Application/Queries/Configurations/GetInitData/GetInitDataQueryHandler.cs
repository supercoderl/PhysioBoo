using MediatR;
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Configurations;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Entities.System;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Configurations.GetInitData
{
    public sealed class GetInitDataQueryHandler : IRequestHandler<GetInitDataQuery, InitDataViewModel>
    {
        private readonly IRoleRepository _roleRepository;
        private readonly ISys_LanguageRepository _languageRepository;

        public GetInitDataQueryHandler(
            IRoleRepository roleRepository,
            ISys_LanguageRepository languageRepository
        )
        {
            _roleRepository = roleRepository;
            _languageRepository = languageRepository;
        }

        public async Task<InitDataViewModel> Handle(GetInitDataQuery req, CancellationToken cancellationToken)
        {
            List<Role> roles = await _roleRepository.GetAllNoTracking(
                filter: role => role.IsPublicForRegistration
            ).ToListAsync();

            List<Sys_Language> languages = await _languageRepository.GetAllNoTracking(
                filter: language => language.IsActive
            ).ToListAsync();

            // Map to view model
            return InitDataViewModel.FromConfig(roles, languages);
        }
    }
}
