using PhysioBoo.Application.Commands.WarehouseZones.CreateWarehouseZone;
using PhysioBoo.Application.Commands.WarehouseZones.DeleteWarehouseZone;
using PhysioBoo.Application.Commands.WarehouseZones.UpdateWarehouseZone;
using PhysioBoo.Application.ViewModels.WarehouseZones;





namespace PhysioBoo.Presentation.Endpoints
{
    public static class WarehouseZoneEndpoints
    {
        public static void MapWarehouseZoneEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/warehouse-zones")
                .WithTags("Warehouse Zones")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create warehouse zone
            group.MapPost("/create", async (
                CreateWarehouseZoneViewModel newZone,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new CreateWarehouseZoneCommand(newZone));

                return Results.Created($"/api/warehouse-zones/{newZone.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newZone.Id
                });
            }).WithName("CreateWarehouseZone")
            .WithSummary("Create a new warehouse zone")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Pharmacy.WarehouseZoneCreate);

            // Update warehouse zone
            group.MapPatch("/{id:guid}", async (
                Guid id,
                UpdateWarehouseZoneViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new UpdateWarehouseZoneCommand(request, id));

                return Results.NoContent();
            }).WithName("UpdateWarehouseZone")
            .WithSummary("Update an existing warehouse zone")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Pharmacy.WarehouseZoneUpdate);

            // Delete warehouse zone
            group.MapDelete("/{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new DeleteWarehouseZoneCommand(id));

                return Results.NoContent();
            }).WithName("DeleteWarehouseZone")
            .WithSummary("Delete a warehouse zone")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Pharmacy.WarehouseZoneDelete);
        }
    }
}
