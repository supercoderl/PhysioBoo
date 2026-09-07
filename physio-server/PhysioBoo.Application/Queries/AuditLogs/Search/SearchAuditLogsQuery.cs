
using PhysioBoo.Application.ViewModels.AuditLogs;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.AuditLogs.Search
{
    public sealed record SearchAuditLogsQuery(PagedRequest<AuditLogFilter> Request) : IRequest<PagedResult<AuditLogViewModel>>;
}
