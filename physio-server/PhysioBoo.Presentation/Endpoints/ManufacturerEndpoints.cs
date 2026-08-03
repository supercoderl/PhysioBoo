using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.Manufacturers.CreateManufacturer;
using PhysioBoo.Application.Commands.Manufacturers.DeleteManufacturer;
using PhysioBoo.Application.Commands.Manufacturers.UpdateManufacturer;
using PhysioBoo.Application.Queries.Manufacturers.GetAll;
using PhysioBoo.Application.Queries.Manufacturers.GetById;
using PhysioBoo.Application.ViewModels.Manufacturers;
using PhysioBoo.Domain.Constants;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class ManufacturerEndpoints
    {
        public static void MapManufacturerEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/manufacturers")
                .WithTags("Manufacturers")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Create New Manufacturer
            group.MapPost("", async (
                [FromBody] CreateManufacturerViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                Guid newId = Guid.NewGuid();
                await bus.SendCommandAsync(new CreateManufacturerCommand(request, newId));

                return Results.CreatedAtRoute(
                    "GetManufacturerById",
                    new { id = newId },
                    new ResponseMessage<Guid>
                    {
                        Success = true,
                        Data = newId
                    }
                );
            }).WithName("CreateManufacturer")
            .WithSummary("Create new manufacturer")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Pharmacy.ManufacturerCreate);
            #endregion

            #region Get All Manufacturers
            group.MapPost("search", async (
                [FromBody] PagedRequest<ManufacturerFilter> request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedResult<ManufacturerViewModel> result = await bus.QueryAsync(new GetAllManufacturersQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<ManufacturerViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetManufacturers")
            .WithSummary("Retrieve a paginated list of manufacturers with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<ManufacturerViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<ManufacturerViewModel>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Pharmacy.ManufacturerRead);
            #endregion

            #region Delete Manufacturer
            group.MapDelete("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new DeleteManufacturerCommand(id));

                return Results.NoContent();
            }).WithName("DeleteManufacturer")
            .WithSummary("Handles requests to delete a specific manufacturer by its identifier.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Pharmacy.ManufacturerDelete);
            #endregion

            #region Update Manufacturer
            group.MapPatch("{id:guid}", async (
                Guid id,
                [FromBody] UpdateManufacturerViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new UpdateManufacturerCommand(request, id));

                return Results.NoContent();
            }).WithName("UpdateManufacturer")
            .WithSummary("Update manufacturer")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Pharmacy.ManufacturerUpdate);
            #endregion

            #region Get Manufacturer By Id
            group.MapGet("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                ManufacturerViewModel? result = await bus.QueryAsync(new GetManufacturerByIdQuery(id));

                return Results.Ok(new ResponseMessage<ManufacturerViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetManufacturerById")
            .WithSummary("Retrieve a manufacturer record.")
            .Produces<ResponseMessage<ManufacturerViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<ManufacturerViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Pharmacy.ManufacturerRead);
            #endregion
        }
    }
}
