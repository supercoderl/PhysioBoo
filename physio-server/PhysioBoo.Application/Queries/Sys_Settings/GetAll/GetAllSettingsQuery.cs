using MediatR;
using PhysioBoo.Application.ViewModels.Sys_Settings;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.Sys_Settings.GetAll
{
    public sealed record GetAllSettingsQuery(
        PagedRequest<SettingFilter> Request
    ) : IRequest<PagedResult<SettingViewModel>>;
}
