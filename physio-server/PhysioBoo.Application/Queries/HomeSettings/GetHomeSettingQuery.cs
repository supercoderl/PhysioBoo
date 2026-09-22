using PhysioBoo.Application.ViewModels.HomeSettings;

namespace PhysioBoo.Application.Queries.HomeSettings
{
    public sealed record GetHomeSettingsQuery : IRequest<HomeSettingsViewModel>;
}
