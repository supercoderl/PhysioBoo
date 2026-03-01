using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.Suppliers.CreateSupplier;
using PhysioBoo.Application.Commands.Suppliers.DeleteSupplier;
using PhysioBoo.Application.Commands.Suppliers.UpdateSupplier;
using PhysioBoo.Application.Queries.Suppliers.GetAll;
using PhysioBoo.Application.Queries.Suppliers.GetById;
using PhysioBoo.Application.ViewModels.Suppliers;
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
                .WithTags("Supplier")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Create New Supplier
            group.MapPost("/create", async (
                CreateSupplierViewModel newSupplier,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateSupplierCommand(newSupplier));

                return Results.Created($"/api/suppliers/{newSupplier.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newSupplier.Id
                });
            }).WithName("CreatSupplier")
            .WithSummary("Create new supplier")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Get All Suppliers
            group.MapPost("/search", async (
                [FromBody] PagedRequest<SupplierFilter> request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                PagedResult<SupplierViewModel> result = await bus.QueryAsync(new GetAllSuppliersQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<SupplierViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchSuppliers")
            .WithSummary("Retrieve a paginated list of suppliers with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<SupplierViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<SupplierViewModel>>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Delete Supplier
            group.MapPost("/delete", async (
                DeleteSupplierViewModel request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new DeleteSupplierCommand(request.Id, request.IsHard));

                return Results.Ok(new ResponseMessage<string>
                {
                    Success = true,
                    Data = "Supplier has been deleted successfully."
                });
            }).WithName("DeleteSupplier")
            .WithSummary("Handles requests to delete a specific record by its identifier and returns the appropriate result after the operation.")
            .Produces<ResponseMessage<string>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<string>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Update Supplier
            group.MapPost("/update", async (
                UpdateSupplierViewModel Supplier,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new UpdateSupplierCommand(Supplier));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = Supplier.Id
                });
            }).WithName("UpdateSupplier")
            .WithSummary("Update supplier")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Get Supplier By Id
            group.MapPost("/search-by-id", async (
                [FromBody] SupplierSingleFilter request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                SupplierViewModel? result = await bus.QueryAsync(new GetSupplierByIdQuery(request.Id));

                return Results.Ok(new ResponseMessage<SupplierViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchSupplier")
            .WithSummary("Retrieve a supplier record.")
            .Produces<ResponseMessage<SupplierViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<SupplierViewModel?>>(StatusCodes.Status400BadRequest);
            #endregion
        }
    }
}
