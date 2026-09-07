
using PhysioBoo.Application.ViewModels.AuditLogs;

namespace PhysioBoo.Application.Queries.AuditLogs.GetById
{
    public sealed record GetAuditLogByIdQuery(Guid Id) : IRequest<AuditLogViewModel?>;
}
