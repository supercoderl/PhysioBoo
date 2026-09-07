using PhysioBoo.Application.Queries.AuditLogs.GetById;
using PhysioBoo.Application.Queries.AuditLogs.Search;
using PhysioBoo.Application.ViewModels.AuditLogs;






namespace PhysioBoo.Presentation.Endpoints
{
    // Read-only — the write side already exists and works today via ApplicationDbContext's
    // SaveChanges interceptor (see AuditEntry.ToAudit()), which was previously write-only/invisible
    // with no way to query it back. No frontend page consumes this yet (module 12 backend only —
    // a frontend audit-log viewer would be a separate follow-up, same pattern as flagged for
    // module 11's remote-payment page).
    public static class AuditLogEndpoints
    {
        public static void MapAuditLogEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/audit-logs")
                .WithTags("Audit Logs")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            group.MapGet("/search", async (
                string? search,
                int pageNumber,
                int pageSize,
                string? tableName,
                string? action,
                Guid? userId,
                DateTimeOffset? dateFrom,
                DateTimeOffset? dateTo,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedRequest<AuditLogFilter> request = new PagedRequest<AuditLogFilter>
                {
                    Search = search,
                    PageNumber = pageNumber <= 0 ? 1 : pageNumber,
                    PageSize = pageSize <= 0 ? 50 : pageSize,
                    Filter = new AuditLogFilter { TableName = tableName, Action = action, UserId = userId, DateFrom = dateFrom, DateTo = dateTo }
                };

                PagedResult<AuditLogViewModel> result = await bus.QueryAsync(new SearchAuditLogsQuery(request));
                return Results.Ok(new ResponseMessage<PagedResult<AuditLogViewModel>> { Success = true, Data = result });
            }).WithName("SearchAuditLogs")
            .WithSummary("Search/filter audit log entries")
            .Produces<ResponseMessage<PagedResult<AuditLogViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.System.AuditLogRead);

            group.MapGet("/{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                AuditLogViewModel? result = await bus.QueryAsync(new GetAuditLogByIdQuery(id));
                return Results.Ok(new ResponseMessage<AuditLogViewModel?> { Success = true, Data = result });
            }).WithName("GetAuditLogById")
            .WithSummary("Full detail (old/new values) for a single audit log entry")
            .Produces<ResponseMessage<AuditLogViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.System.AuditLogRead);
        }
    }
}
