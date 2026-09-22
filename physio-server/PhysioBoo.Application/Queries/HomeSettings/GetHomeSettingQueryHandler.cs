using PhysioBoo.Application.ViewModels.HomeSettings;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.HomeSettings
{
    public sealed class GetHomeSettingQueryHandler : IRequestHandler<GetHomeSettingsQuery, HomeSettingsViewModel>
    {
        private readonly IUser _user;
        private readonly IHomeSettingRepository _homeSettingRepository;

        public GetHomeSettingQueryHandler(
            IUser user,
            IHomeSettingRepository homeSettingRepository
        )
        {
            _user = user;
            _homeSettingRepository = homeSettingRepository;
        }

        public async Task<HomeSettingsViewModel> Handle(GetHomeSettingsQuery request, CancellationToken cancellationToken)
        {
            Domain.Entities.Core.HomeSetting? setting = await _homeSettingRepository.GetByTenantIdAsync(_user.GetTenantId(), cancellationToken);
            if (setting == null)
            {
                return new();
            }

            return HomeSettingsViewModel.FromEntity(setting);
        }
    }
}
