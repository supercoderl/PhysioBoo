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
                .WithTags("Lab Test Category")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Create New Lab Test Category    
            group.MapPost("/create", async (
                CreateLabTestCategoryViewModel newLabTestCategory,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateLabTestCategoryCommand(newLabTestCategory));

                return Results.Created($"/api/lab-test-categories/{newLabTestCategory.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newLabTestCategory.Id
                });
            }).WithName("CreateLabTestCategory")
            .WithSummary("Create new lab test category")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Get All Lab Test Categories
            group.MapPost("/search", async (
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
            }).WithName("SearchLabTestCategories")
            .WithSummary("Retrieve a paginated list of lab test categories with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<LabTestCategoryViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<LabTestCategoryViewModel>>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Get Lab Test Category Lookups
            group.MapPost("/lookup", async (
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
            .WithSummary("Retrieve a paginated list of lab test categories for selection.")
            .Produces<ResponseMessage<PagedResult<LabTestCategoryLookupViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<LabTestCategoryLookupViewModel>>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Delete Lab Test Category
            group.MapPost("/delete", async (
                DeleteLabTestCategoryViewModel request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new DeleteLabTestCategoryCommand(request.Id, request.IsHard));

                return Results.Ok(new ResponseMessage<string>
                {
                    Success = true,
                    Data = "Lab test category has been deleted successfully."
                });
            }).WithName("DeleteLabTestCategory")
            .WithSummary("Handles requests to delete a specific record by its identifier and returns the appropriate result after the operation.")
            .Produces<ResponseMessage<string>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<string>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Update Lab Test Category
            group.MapPost("/update", async (
                UpdateLabTestCategoryViewModel LabTestCategory,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new UpdateLabTestCategoryCommand(LabTestCategory));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = LabTestCategory.Id
                });
            }).WithName("UpdateLabTestCategory")
            .WithSummary("Update lab test category")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Get Lab Test Category By Id
            group.MapPost("/search-by-id", async (
                [FromBody] LabTestCategorySingleFilter request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                LabTestCategoryViewModel? result = await bus.QueryAsync(new GetLabTestCategoryByIdQuery(request.Id));

                return Results.Ok(new ResponseMessage<LabTestCategoryViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchLabTestCategory")
            .WithSummary("Retrieve a medical specialty record.")
            .Produces<ResponseMessage<LabTestCategoryViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<LabTestCategoryViewModel?>>(StatusCodes.Status400BadRequest);
            #endregion
        }
    }
}
