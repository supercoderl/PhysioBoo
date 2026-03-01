using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.Manufacturers.CreateManufacturer;
using PhysioBoo.Application.Commands.Manufacturers.DeleteManufacturer;
using PhysioBoo.Application.Commands.Manufacturers.UpdateManufacturer;
using PhysioBoo.Application.Queries.Manufacturers.GetAll;
using PhysioBoo.Application.Queries.Manufacturers.GetById;
using PhysioBoo.Application.ViewModels.Manufacturers;
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
            group.MapPost("/create", async (
                CreateManufacturerViewModel newManufacturer,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateManufacturerCommand(newManufacturer));

                return Results.Created($"/api/manufacturers/{newManufacturer.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newManufacturer.Id
                });
            }).WithName("CreateManufacturer")
            .WithSummary("Create new manufacturer")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Get All Manufacturers
            group.MapPost("/search", async (
                [FromBody] PagedRequest<ManufacturerFilter> request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                PagedResult<ManufacturerViewModel> result = await bus.QueryAsync(new GetAllManufacturersQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<ManufacturerViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchManufacturers")
            .WithSummary("Retrieve a paginated list of manufacturers with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<ManufacturerViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<ManufacturerViewModel>>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Delete Manufacturer
            group.MapPost("/delete", async (
                DeleteManufacturerViewModel request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new DeleteManufacturerCommand(request.Id, request.IsHard));

                return Results.Ok(new ResponseMessage<string>
                {
                    Success = true,
                    Data = "Manufacturer has been deleted successfully."
                });
            }).WithName("DeleteManufacturer")
            .WithSummary("Handles requests to delete a specific record by its identifier and returns the appropriate result after the operation.")
            .Produces<ResponseMessage<string>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<string>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Update Manufacturer
            group.MapPost("/update", async (
                UpdateManufacturerViewModel Manufacturer,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new UpdateManufacturerCommand(Manufacturer));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = Manufacturer.Id
                });
            }).WithName("UpdateManufacturer")
            .WithSummary("Update manufacturer")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Get Manufacturer By Id
            group.MapPost("/search-by-id", async (
                [FromBody] ManufacturerSingleFilter request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                ManufacturerViewModel? result = await bus.QueryAsync(new GetManufacturerByIdQuery(request.Id));

                return Results.Ok(new ResponseMessage<ManufacturerViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchManufacturer")
            .WithSummary("Retrieve a manufacturer record.")
            .Produces<ResponseMessage<ManufacturerViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<ManufacturerViewModel?>>(StatusCodes.Status400BadRequest);
            #endregion
        }
    }
}
