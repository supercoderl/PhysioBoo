using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.Suppliers.CreateSupplier;
using PhysioBoo.Application.Commands.Suppliers.DeleteSupplier;
using PhysioBoo.Application.Commands.Suppliers.UpdateSupplier;
using PhysioBoo.Application.Queries.Suppliers.GetAll;
using PhysioBoo.Application.Queries.Suppliers.GetById;
using PhysioBoo.Application.ViewModels.Suppliers;
using PhysioBoo.Domain.Constants;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class SupplierEndpoints
    {
        public static void MapSupplierEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/suppliers")
                .WithTags("Suppliers")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Create New Supplier
            group.MapPost("", async (
                [FromBody] CreateSupplierViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                Guid newId = Guid.NewGuid();
                await bus.SendCommandAsync(new CreateSupplierCommand(request, newId));

                return Results.CreatedAtRoute(
                    "GetSupplierById",
                    new { id = newId },
                    new ResponseMessage<Guid>
                    {
                        Success = true,
                        Data = newId
                    }
                );
            }).WithName("CreateSupplier")
            .WithSummary("Create new supplier")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Pharmacy.SupplierCreate);
            #endregion

            #region Get All Suppliers
            group.MapPost("search", async (
                [FromBody] PagedRequest<SupplierFilter> request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedResult<SupplierViewModel> result = await bus.QueryAsync(new GetAllSuppliersQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<SupplierViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetSuppliers")
            .WithSummary("Retrieve a paginated list of suppliers with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<SupplierViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<SupplierViewModel>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Pharmacy.SupplierRead);
            #endregion

            #region Delete Supplier
            group.MapDelete("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new DeleteSupplierCommand(id));

                return Results.NoContent();
            }).WithName("DeleteSupplier")
            .WithSummary("Handles requests to delete a specific supplier by its identifier.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Pharmacy.SupplierDelete);
            #endregion

            #region Update Supplier
            group.MapPatch("{id:guid}", async (
                Guid id,
                [FromBody] UpdateSupplierViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new UpdateSupplierCommand(request, id));

                return Results.NoContent();
            }).WithName("UpdateSupplier")
            .WithSummary("Update supplier")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Pharmacy.SupplierUpdate);
            #endregion

            #region Get Supplier By Id
            group.MapGet("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                SupplierViewModel? result = await bus.QueryAsync(new GetSupplierByIdQuery(id));

                return Results.Ok(new ResponseMessage<SupplierViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetSupplierById")
            .WithSummary("Retrieve a supplier record.")
            .Produces<ResponseMessage<SupplierViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<SupplierViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Pharmacy.SupplierRead);
            #endregion
        }
    }
}
