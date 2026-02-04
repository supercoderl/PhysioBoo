using MediatR;
using PhysioBoo.Application.ViewModels.Sys_Settings;
using PhysioBoo.Domain.Entities.System;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;
using System.Linq.Expressions;

namespace PhysioBoo.Application.Queries.Sys_Settings.GetAll
{
    public sealed class GetAllSettingsQueryHandler : IRequestHandler<GetAllSettingsQuery, PagedResult<SettingViewModel>>
    {
        private readonly ISys_SettingRepository _settingRepository;

        public GetAllSettingsQueryHandler(
            ISys_SettingRepository settingRepository
        )
        {
            _settingRepository = settingRepository;
        }

        public async Task<PagedResult<SettingViewModel>> Handle(GetAllSettingsQuery q, CancellationToken cancellationToken)
        {
            PagedRequest<SettingFilter> req = q.Request;
            Expression<Func<Sys_Setting, bool>>? predicate = null;

            if (req.Filter != null)
            {
                predicate = u =>
                    (!req.Filter.IsSystem.HasValue || u.IsSystem == req.Filter.IsSystem.Value);
            }

            Func<IQueryable<Sys_Setting>, IOrderedQueryable<Sys_Setting>>? orderBy = null;
            if (!string.IsNullOrEmpty(req.Sort))
            {
                if (req.Sort.Equals("key", StringComparison.OrdinalIgnoreCase))
                    orderBy = q => q.OrderBy(u => u.Key);
            }

            PagedResult<Sys_Setting> paged = await _settingRepository.GetPagedAsync(
                pageNumber: req.PageNumber,
                pageSize: req.PageSize,
                filter: predicate,
                orderBy: orderBy,
                cancellationToken: cancellationToken
            );

            // Map to view model
            List<SettingViewModel> items = paged.Items.Select(s => SettingViewModel.FromSetting(s)).ToList();
            return new PagedResult<SettingViewModel>(paged.TotalCount, items, req.PageNumber, req.PageSize);
        }
    }
}
