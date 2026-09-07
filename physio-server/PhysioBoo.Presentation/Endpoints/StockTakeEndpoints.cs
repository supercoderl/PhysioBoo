using PhysioBoo.Application.Commands.StockTakes.ApproveStockTake;
using PhysioBoo.Application.Commands.StockTakes.AssignCounter;
using PhysioBoo.Application.Commands.StockTakes.CancelStockTake;
using PhysioBoo.Application.Commands.StockTakes.CompleteStockTake;
using PhysioBoo.Application.Commands.StockTakes.CreateStockTake;
using PhysioBoo.Application.Commands.StockTakes.DeleteStockTake;
using PhysioBoo.Application.Commands.StockTakes.RejectStockTake;
using PhysioBoo.Application.Commands.StockTakes.StartStockTake;
using PhysioBoo.Application.Commands.StockTakes.UpdateStockTake;
using PhysioBoo.Application.Commands.StockTakes.UpdateStockTakeItems;
using PhysioBoo.Application.Queries.StockTakes.GetById;
using PhysioBoo.Application.Queries.StockTakes.GetCategories;
using PhysioBoo.Application.Queries.StockTakes.GetHistory;
using PhysioBoo.Application.Queries.StockTakes.GetItems;
using PhysioBoo.Application.Queries.StockTakes.GetKpis;
using PhysioBoo.Application.Queries.StockTakes.GetRecentActivities;
using PhysioBoo.Application.Queries.StockTakes.GetSummary;
using PhysioBoo.Application.Queries.StockTakes.GetWarehouses;
using PhysioBoo.Application.Queries.StockTakes.Search;
using PhysioBoo.Application.ViewModels.StockTakes;






namespace PhysioBoo.Presentation.Endpoints
{
    public static class StockTakeEndpoints
    {
        public static void MapStockTakeEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/stock-takes")
                .WithTags("Stock Take")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Search (paged, filtered) — POST with a body, correcting the frontend's current GET call
            // per the doc/code mismatch flagged in discovery.
            group.MapPost("/search", async (
                PagedRequest<StockTakeFilter> request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedResult<StockTakeViewModel> result = await bus.QueryAsync(new SearchStockTakesQuery(request));
                return Results.Ok(new ResponseMessage<PagedResult<StockTakeViewModel>> { Success = true, Data = result });
            }).WithName("SearchStockTakes")
            .Produces<ResponseMessage<PagedResult<StockTakeViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.StockTakeRead);

            // KPIs
            group.MapGet("/kpis", async (
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                StockTakeKpisViewModel result = await bus.QueryAsync(new GetStockTakeKpisQuery());
                return Results.Ok(new ResponseMessage<StockTakeKpisViewModel> { Success = true, Data = result });
            }).WithName("GetStockTakeKpis")
            .Produces<ResponseMessage<StockTakeKpisViewModel>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.StockTakeRead);

            // Recent activities across all stock takes
            group.MapGet("/activities", async (
                int limit,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                List<StockTakeActivityViewModel> result = await bus.QueryAsync(new GetRecentStockTakeActivitiesQuery(limit));
                return Results.Ok(new ResponseMessage<List<StockTakeActivityViewModel>> { Success = true, Data = result });
            }).WithName("GetRecentStockTakeActivities")
            .Produces<ResponseMessage<List<StockTakeActivityViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.StockTakeRead);

            // Get by id
            group.MapGet("/{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                StockTakeViewModel? result = await bus.QueryAsync(new GetStockTakeByIdQuery(id));
                return Results.Ok(new ResponseMessage<StockTakeViewModel?> { Success = true, Data = result });
            }).WithName("GetStockTakeById")
            .Produces<ResponseMessage<StockTakeViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.StockTakeRead);

            // Create
            group.MapPost("/", async (
                CreateStockTakeRequestBody body,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                CreateStockTakeViewModel newStockTake = new CreateStockTakeViewModel(
                    Guid.NewGuid(), body.WarehouseId, body.DepartmentId, body.ScheduledDate, body.AssignedTo, body.Notes
                );
                await bus.SendCommandAsync(new CreateStockTakeCommand(newStockTake));
                StockTakeViewModel? result = await bus.QueryAsync(new GetStockTakeByIdQuery(newStockTake.Id));
                return Results.Created($"/api/stock-takes/{newStockTake.Id}", new ResponseMessage<StockTakeViewModel?> { Success = true, Data = result });
            }).WithName("CreateStockTake")
            .Produces<ResponseMessage<StockTakeViewModel?>>(StatusCodes.Status201Created)
            .RequireAuthorization(Permissions.Pharmacy.StockTakeCreate);

            // Update — PUT, correcting the frontend's current POST call.
            group.MapPut("/{id:guid}", async (
                Guid id,
                UpdateStockTakeViewModel body,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new UpdateStockTakeCommand(body, id));
                StockTakeViewModel? result = await bus.QueryAsync(new GetStockTakeByIdQuery(id));
                return Results.Ok(new ResponseMessage<StockTakeViewModel?> { Success = true, Data = result });
            }).WithName("UpdateStockTake")
            .Produces<ResponseMessage<StockTakeViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.StockTakeUpdate);

            // Delete — DELETE, correcting the frontend's current POST call.
            group.MapDelete("/{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new DeleteStockTakeCommand(id));
                return Results.NoContent();
            }).WithName("DeleteStockTake")
            .Produces(StatusCodes.Status204NoContent)
            .RequireAuthorization(Permissions.Pharmacy.StockTakeDelete);

            // Start
            group.MapPost("/{id:guid}/start", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new StartStockTakeCommand(id));
                StockTakeViewModel? result = await bus.QueryAsync(new GetStockTakeByIdQuery(id));
                return Results.Ok(new ResponseMessage<StockTakeViewModel?> { Success = true, Data = result });
            }).WithName("StartStockTake")
            .Produces<ResponseMessage<StockTakeViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.StockTakeUpdate);

            // Complete (submit for approval)
            group.MapPost("/{id:guid}/complete", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new CompleteStockTakeCommand(id));
                StockTakeViewModel? result = await bus.QueryAsync(new GetStockTakeByIdQuery(id));
                return Results.Ok(new ResponseMessage<StockTakeViewModel?> { Success = true, Data = result });
            }).WithName("CompleteStockTake")
            .Produces<ResponseMessage<StockTakeViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.StockTakeUpdate);

            // Approve (reconciles inventory)
            group.MapPost("/{id:guid}/approve", async (
                Guid id,
                ApproveStockTakeViewModel body,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new ApproveStockTakeCommand(id, body));
                StockTakeViewModel? result = await bus.QueryAsync(new GetStockTakeByIdQuery(id));
                return Results.Ok(new ResponseMessage<StockTakeViewModel?> { Success = true, Data = result });
            }).WithName("ApproveStockTake")
            .Produces<ResponseMessage<StockTakeViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.StockTakeApprove);

            // Reject
            group.MapPost("/{id:guid}/reject", async (
                Guid id,
                RejectStockTakeViewModel body,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new RejectStockTakeCommand(id, body));
                StockTakeViewModel? result = await bus.QueryAsync(new GetStockTakeByIdQuery(id));
                return Results.Ok(new ResponseMessage<StockTakeViewModel?> { Success = true, Data = result });
            }).WithName("RejectStockTake")
            .Produces<ResponseMessage<StockTakeViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.StockTakeReject);

            // Cancel — reason is accepted for API-contract parity but not persisted yet (no
            // CancelReason field on StockTake; add one if audit history needs to show why).
            group.MapPost("/{id:guid}/cancel", async (
                Guid id,
                CancelStockTakeRequestBody body,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new CancelStockTakeCommand(id));
                StockTakeViewModel? result = await bus.QueryAsync(new GetStockTakeByIdQuery(id));
                return Results.Ok(new ResponseMessage<StockTakeViewModel?> { Success = true, Data = result });
            }).WithName("CancelStockTake")
            .Produces<ResponseMessage<StockTakeViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.StockTakeUpdate);

            // Assign counter
            group.MapPost("/{id:guid}/assign", async (
                Guid id,
                AssignCounterViewModel body,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new AssignCounterCommand(id, body));
                StockTakeViewModel? result = await bus.QueryAsync(new GetStockTakeByIdQuery(id));
                return Results.Ok(new ResponseMessage<StockTakeViewModel?> { Success = true, Data = result });
            }).WithName("AssignStockTakeCounter")
            .Produces<ResponseMessage<StockTakeViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.StockTakeUpdate);

            // Get items
            group.MapGet("/{id:guid}/items", async (
                Guid id,
                Guid? categoryId,
                string? search,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                List<StockTakeItemViewModel> result = await bus.QueryAsync(new GetStockTakeItemsQuery(id, categoryId, search));
                return Results.Ok(new ResponseMessage<List<StockTakeItemViewModel>> { Success = true, Data = result });
            }).WithName("GetStockTakeItems")
            .Produces<ResponseMessage<List<StockTakeItemViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.StockTakeRead);

            // Update items (bulk count entry)
            group.MapPost("/{id:guid}/items", async (
                Guid id,
                UpdateStockTakeItemsViewModel body,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new UpdateStockTakeItemsCommand(id, body));
                List<StockTakeItemViewModel> result = await bus.QueryAsync(new GetStockTakeItemsQuery(id, null, null));
                return Results.Ok(new ResponseMessage<List<StockTakeItemViewModel>> { Success = true, Data = result });
            }).WithName("UpdateStockTakeItems")
            .Produces<ResponseMessage<List<StockTakeItemViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.StockTakeUpdate);

            // Categories
            group.MapGet("/{id:guid}/categories", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                List<StockTakeCategoryNodeViewModel> result = await bus.QueryAsync(new GetStockTakeCategoriesQuery(id));
                return Results.Ok(new ResponseMessage<List<StockTakeCategoryNodeViewModel>> { Success = true, Data = result });
            }).WithName("GetStockTakeCategories")
            .Produces<ResponseMessage<List<StockTakeCategoryNodeViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.StockTakeRead);

            // Summary
            group.MapGet("/{id:guid}/summary", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                StockTakeSummaryViewModel result = await bus.QueryAsync(new GetStockTakeSummaryQuery(id));
                return Results.Ok(new ResponseMessage<StockTakeSummaryViewModel> { Success = true, Data = result });
            }).WithName("GetStockTakeSummary")
            .Produces<ResponseMessage<StockTakeSummaryViewModel>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.StockTakeRead);

            // History (this stock take's activity trail)
            group.MapGet("/{id:guid}/history", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                List<StockTakeActivityViewModel> result = await bus.QueryAsync(new GetStockTakeHistoryQuery(id));
                return Results.Ok(new ResponseMessage<List<StockTakeActivityViewModel>> { Success = true, Data = result });
            }).WithName("GetStockTakeHistory")
            .Produces<ResponseMessage<List<StockTakeActivityViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.StockTakeRead);

            // Print — JSON representation for this pass, same simplification as Retail's receipt
            // endpoint (no PDF renderer wired up yet).
            group.MapPost("/{id:guid}/print", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                StockTakeViewModel? result = await bus.QueryAsync(new GetStockTakeByIdQuery(id));
                return Results.Ok(new ResponseMessage<StockTakeViewModel?> { Success = true, Data = result });
            }).WithName("PrintStockTake")
            .Produces<ResponseMessage<StockTakeViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.StockTakeRead);

            // Warehouses lookup — thin projection over Hospital (api/warehouses, top-level, not
            // nested under api/stock-takes, matching the frontend's existing call shape).
            app.MapGet("api/warehouses", async (
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                List<WarehouseLookupViewModel> result = await bus.QueryAsync(new GetWarehousesQuery());
                return Results.Ok(new ResponseMessage<List<WarehouseLookupViewModel>> { Success = true, Data = result });
            }).WithName("GetWarehouses")
            .WithTags("Stock Take")
            .WithOpenApi()
            .Produces<ResponseMessage<List<WarehouseLookupViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.StockTakeRead);
        }

        public sealed record CreateStockTakeRequestBody(Guid WarehouseId, Guid DepartmentId, DateOnly ScheduledDate, Guid? AssignedTo, string? Notes);
        public sealed record CancelStockTakeRequestBody(string? Reason);
    }
}
