using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.LabTestCategories.CreateLabTestCategory;
using PhysioBoo.Application.Commands.LabTestCategories.DeleteLabTestCategory;
using PhysioBoo.Application.Commands.LabTestCategories.UpdateLabTestCategory;
using PhysioBoo.Application.Queries.LabTestCategories.GetAll;
using PhysioBoo.Application.Queries.LabTestCategories.GetById;
using PhysioBoo.Application.Queries.LabTestCategories.GetLookup;
using PhysioBoo.Application.ViewModels.LabTestCategories;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class LabTestCategoryEndpoints
    {
        public static void MapLabTestCategoryEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/lab-test-categories")
                .WithTags("Lab Test Categories")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Create New Lab Test Category
            group.MapPost("", async (
                [FromBody] CreateLabTestCategoryViewModel request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                Guid newId = Guid.NewGuid();
                await bus.SendCommandAsync(new CreateLabTestCategoryCommand(request, newId));

                return Results.CreatedAtRoute(
                    "GetLabTestCategoryById",
                    new { id = newId },
                    new ResponseMessage<Guid>
                    {
                        Success = true,
                        Data = newId
                    }
                );
            }).WithName("CreateLabTestCategory")
            .WithSummary("Create new lab test category")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion

            #region Get All Lab Test Categories
            group.MapPost("search", async (
                [FromBody] PagedRequest<LabTestCategoryFilter> request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                PagedResult<LabTestCategoryViewModel> result = await bus.QueryAsync(new GetAllLabTestCategoriesQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<LabTestCategoryViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetLabTestCategories")
            .WithSummary("Retrieve a paginated list of lab test categories with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<LabTestCategoryViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<LabTestCategoryViewModel>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion

            #region Get Lab Test Category Lookups
            group.MapPost("lookup", async (
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                PagedResult<LabTestCategoryLookupViewModel> result = await bus.QueryAsync(new GetLabTestCategoryLookupsQuery());

                return Results.Ok(new ResponseMessage<PagedResult<LabTestCategoryLookupViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetLabTestCategoryLookups")
            .WithSummary("Retrieve a list of lab test categories for selection.")
            .Produces<ResponseMessage<PagedResult<LabTestCategoryLookupViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<LabTestCategoryLookupViewModel>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion

            #region Delete Lab Test Category
            group.MapDelete("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new DeleteLabTestCategoryCommand(id));

                return Results.NoContent();
            }).WithName("DeleteLabTestCategory")
            .WithSummary("Handles requests to delete a specific lab test category by its identifier.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion

            #region Update Lab Test Category
            group.MapPatch("{id:guid}", async (
                Guid id,
                [FromBody] UpdateLabTestCategoryViewModel request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new UpdateLabTestCategoryCommand(request, id));

                return Results.NoContent();
            }).WithName("UpdateLabTestCategory")
            .WithSummary("Update lab test category")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .RequireAuthorization();
            #endregion

            #region Get Lab Test Category By Id
            group.MapGet("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                LabTestCategoryViewModel? result = await bus.QueryAsync(new GetLabTestCategoryByIdQuery(id));

                return Results.Ok(new ResponseMessage<LabTestCategoryViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetLabTestCategoryById")
            .WithSummary("Retrieve a lab test category record.")
            .Produces<ResponseMessage<LabTestCategoryViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<LabTestCategoryViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion
        }
    }
}
