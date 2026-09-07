
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.AuditLogs;
using PhysioBoo.Domain.Entities.System;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.AuditLogs.Search
{
    public sealed class SearchAuditLogsQueryHandler : IRequestHandler<SearchAuditLogsQuery, PagedResult<AuditLogViewModel>>
    {
        private readonly ISys_AuditLogRepository _auditLogRepository;
        private readonly IUserRepository _userRepository;

        public SearchAuditLogsQueryHandler(
            ISys_AuditLogRepository auditLogRepository,
            IUserRepository userRepository
        )
        {
            _auditLogRepository = auditLogRepository;
            _userRepository = userRepository;
        }

        public async Task<PagedResult<AuditLogViewModel>> Handle(SearchAuditLogsQuery q, CancellationToken ct)
        {
            PagedRequest<AuditLogFilter> request = q.Request;

            IQueryable<Sys_AuditLog> query = _auditLogRepository
                .GetAllNoTracking()
                .OrderByDescending(a => a.DateOccurred);

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string term = request.Search.Trim().ToLower();
                query = query.Where(a => a.TableName.ToLower().Contains(term) || a.PrimaryKey.ToLower().Contains(term))
                    .OrderByDescending(a => a.DateOccurred);
            }

            if (request.Filter != null)
            {
                if (!string.IsNullOrWhiteSpace(request.Filter.TableName))
                    query = query.Where(a => a.TableName == request.Filter.TableName).OrderByDescending(a => a.DateOccurred);

                if (!string.IsNullOrWhiteSpace(request.Filter.Action) && Enum.TryParse(request.Filter.Action, out AuditAction action))
                    query = query.Where(a => a.Action == action).OrderByDescending(a => a.DateOccurred);

                if (request.Filter.UserId != null)
                    query = query.Where(a => a.UserId == request.Filter.UserId.Value).OrderByDescending(a => a.DateOccurred);

                if (request.Filter.DateFrom != null)
                    query = query.Where(a => a.DateOccurred >= request.Filter.DateFrom.Value).OrderByDescending(a => a.DateOccurred);

                if (request.Filter.DateTo != null)
                    query = query.Where(a => a.DateOccurred <= request.Filter.DateTo.Value).OrderByDescending(a => a.DateOccurred);
            }

            int totalCount = await query.CountAsync(ct);
            int pageNumber = request.PageNumber <= 0 ? 1 : request.PageNumber;
            int pageSize = request.PageSize <= 0 ? 50 : request.PageSize;

            List<Sys_AuditLog> pageItems = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            List<Guid> userIds = pageItems.Where(a => a.UserId.HasValue).Select(a => a.UserId!.Value).Distinct().ToList();
            List<Domain.Entities.Core.User> users = userIds.Count == 0
                ? new List<Domain.Entities.Core.User>()
                : await _userRepository.GetAllNoTracking(filter: u => userIds.Contains(u.Id)).ToListAsync(ct);

            List<AuditLogViewModel> items = pageItems
                .Select(a => AuditLogViewModel.FromEntity(a, users.FirstOrDefault(u => u.Id == a.UserId)?.Email))
                .ToList();

            return new PagedResult<AuditLogViewModel>(totalCount, items, pageNumber, pageSize);
        }
    }
}
