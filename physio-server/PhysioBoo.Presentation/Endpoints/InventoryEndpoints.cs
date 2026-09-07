using PhysioBoo.Application.Commands.InventoryAlerts.AcknowledgeAlert;
using PhysioBoo.Application.Queries.MedicineInventories.GetInventoryAlerts;
using PhysioBoo.Application.Queries.MedicineInventories.GetInventoryHistory;
using PhysioBoo.Application.Queries.MedicineInventories.GetInventoryKpis;
using PhysioBoo.Application.Queries.MedicineInventories.GetMedicineStockDetail;
using PhysioBoo.Application.Queries.MedicineInventories.GetStockInsights;
using PhysioBoo.Application.Queries.MedicineInventories.GetStockMovements;
using PhysioBoo.Application.Queries.MedicineInventories.GetWarehouseBatches;
using PhysioBoo.Application.Queries.MedicineInventories.GetWarehouseZones;
using PhysioBoo.Application.Queries.MedicineInventories.SearchMedicines;
using PhysioBoo.Application.ViewModels.Inventory;

using PhysioBoo.Domain.Enums;





namespace PhysioBoo.Presentation.Endpoints
{
    public static class InventoryEndpoints
    {
        public static void MapInventoryEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/pharmacy/inventory")
                .WithTags("Pharmacy Inventory")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // KPIs
            group.MapGet("/kpis", async (
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                InventoryKpisViewModel result = await bus.QueryAsync(new GetInventoryKpisQuery());

                return Results.Ok(new ResponseMessage<InventoryKpisViewModel>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetInventoryKpis")
            .WithSummary("Warehouse KPI summary")
            .Produces<ResponseMessage<InventoryKpisViewModel>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.MedicineInventoryRead);

            // Search medicines (stock-aware)
            group.MapGet("/medicines/search", async (
                string? search,
                int pageNumber,
                int pageSize,
                string? status,
                Guid? categoryId,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedRequest<MedicineStockFilter> request = new PagedRequest<MedicineStockFilter>
                {
                    Search = search,
                    PageNumber = pageNumber <= 0 ? 1 : pageNumber,
                    PageSize = pageSize <= 0 ? 20 : pageSize,
                    Filter = new MedicineStockFilter { Status = status, CategoryId = categoryId }
                };

                PagedResult<MedicineStockViewModel> result = await bus.QueryAsync(new SearchMedicinesQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<MedicineStockViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchInventoryMedicines")
            .WithSummary("Search medicines with computed stock status")
            .Produces<ResponseMessage<PagedResult<MedicineStockViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.MedicineInventoryRead);

            // Medicine stock detail
            group.MapGet("/medicines/{medicineId:guid}", async (
                Guid medicineId,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                MedicineStockDetailViewModel? result = await bus.QueryAsync(new GetMedicineStockDetailQuery(medicineId));

                return Results.Ok(new ResponseMessage<MedicineStockDetailViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetMedicineStockDetail")
            .WithSummary("Medicine detail with stock aggregates")
            .Produces<ResponseMessage<MedicineStockDetailViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.MedicineInventoryRead);

            // Batches for a medicine (FEFO ordered)
            group.MapGet("/medicines/{medicineId:guid}/batches", async (
                Guid medicineId,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                List<WarehouseBatchViewModel> result = await bus.QueryAsync(new GetWarehouseBatchesQuery(medicineId));

                return Results.Ok(new ResponseMessage<List<WarehouseBatchViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetWarehouseBatches")
            .WithSummary("List a medicine's batches, earliest expiry first")
            .Produces<ResponseMessage<List<WarehouseBatchViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.MedicineInventoryRead);

            // Movement/adjustment history for a medicine
            group.MapGet("/medicines/{medicineId:guid}/history", async (
                Guid medicineId,
                StockMovementType? type,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                List<InventoryHistoryEntryViewModel> result = await bus.QueryAsync(new GetInventoryHistoryQuery(medicineId, type));

                return Results.Ok(new ResponseMessage<List<InventoryHistoryEntryViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetInventoryHistory")
            .WithSummary("Stock movement history for a medicine")
            .Produces<ResponseMessage<List<InventoryHistoryEntryViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.MedicineInventoryRead);

            // Warehouse zones (read)
            group.MapGet("/warehouse/zones", async (
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                List<WarehouseZoneViewModel> result = await bus.QueryAsync(new GetWarehouseZonesQuery());

                return Results.Ok(new ResponseMessage<List<WarehouseZoneViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetWarehouseZonesForInventory")
            .WithSummary("List warehouse zones with computed activity/capacity")
            .Produces<ResponseMessage<List<WarehouseZoneViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.WarehouseZoneRead);

            // Intelligence / insights
            group.MapGet("/intelligence", async (
                Guid? medicineId,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                List<StockInsightViewModel> result = await bus.QueryAsync(new GetStockInsightsQuery(medicineId));

                return Results.Ok(new ResponseMessage<List<StockInsightViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetStockInsights")
            .WithSummary("Simple derived stock insights (low stock / near expiry / out of stock)")
            .Produces<ResponseMessage<List<StockInsightViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.MedicineInventoryRead);

            // Movements feed
            group.MapGet("/movements", async (
                int pageNumber,
                int pageSize,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedResult<StockMovementViewModel> result = await bus.QueryAsync(new GetStockMovementsQuery(
                    pageNumber <= 0 ? 1 : pageNumber,
                    pageSize <= 0 ? 20 : pageSize
                ));

                return Results.Ok(new ResponseMessage<PagedResult<StockMovementViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetStockMovements")
            .WithSummary("Paged stock movement feed, most recent first")
            .Produces<ResponseMessage<PagedResult<StockMovementViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.MedicineInventoryRead);

            // Alerts (read)
            group.MapGet("/alerts", async (
                Guid? medicineId,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                List<InventoryAlertViewModel> result = await bus.QueryAsync(new GetInventoryAlertsQuery(medicineId));

                return Results.Ok(new ResponseMessage<List<InventoryAlertViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetInventoryAlerts")
            .WithSummary("List inventory alerts, optionally scoped to one medicine")
            .Produces<ResponseMessage<List<InventoryAlertViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Pharmacy.InventoryAlertRead);

            // Acknowledge an alert
            group.MapPost("/alerts/{id:guid}/acknowledge", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new AcknowledgeAlertCommand(id));

                return Results.NoContent();
            }).WithName("AcknowledgeInventoryAlert")
            .WithSummary("Acknowledge an inventory alert")
            .Produces(StatusCodes.Status204NoContent)
            .RequireAuthorization(Permissions.Pharmacy.InventoryAlertAcknowledge);
        }
    }
}
