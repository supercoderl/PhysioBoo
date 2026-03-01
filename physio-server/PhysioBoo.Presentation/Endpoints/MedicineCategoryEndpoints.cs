using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.MedicineCategories.CreateMedicineCategory;
using PhysioBoo.Application.Commands.MedicineCategories.DeleteMedicineCategory;
using PhysioBoo.Application.Commands.MedicineCategories.UpdateMedicineCategory;
using PhysioBoo.Application.Queries.MedicineCategories.GetAll;
using PhysioBoo.Application.Queries.MedicineCategories.GetById;
using PhysioBoo.Application.ViewModels.MedicineCategories;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class MedicineCategoryEndpoints
    {
        public static void MapMedicineCategoryEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/medicine-categories")
                .WithTags("Medicine Categories")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Create New Medicine Category
            group.MapPost("/create", async (
                CreateMedicineCategoryViewModel newMedicineCategory,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateMedicineCategoryCommand(newMedicineCategory));

                return Results.Created($"/api/medicine-categories/{newMedicineCategory.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newMedicineCategory.Id
                });
            }).WithName("CreateMedicineCategory")
            .WithSummary("Create new medicine category")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Get All Medicine Categories
            group.MapPost("/search", async (
                [FromBody] PagedRequest<MedicineCategoryFilter> request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                PagedResult<MedicineCategoryViewModel> result = await bus.QueryAsync(new GetAllMedicineCategoriesQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<MedicineCategoryViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchMedicineCategories")
            .WithSummary("Retrieve a paginated list of medicine categories with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<MedicineCategoryViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<MedicineCategoryViewModel>>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Delete Medicine Category
            group.MapPost("/delete", async (
                DeleteMedicineCategoryViewModel request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new DeleteMedicineCategoryCommand(request.Id, request.IsHard));

                return Results.Ok(new ResponseMessage<string>
                {
                    Success = true,
                    Data = "Medicine category has been deleted successfully."
                });
            }).WithName("DeleteMedicineCategory")
            .WithSummary("Handles requests to delete a specific record by its identifier and returns the appropriate result after the operation.")
            .Produces<ResponseMessage<string>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<string>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Update Medicine Category
            group.MapPost("/update", async (
                UpdateMedicineCategoryViewModel MedicineCategory,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new UpdateMedicineCategoryCommand(MedicineCategory));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = MedicineCategory.Id
                });
            }).WithName("UpdateMedicineCategory")
            .WithSummary("Update medicine category")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Get Medicine Category By Id
            group.MapPost("/search-by-id", async (
                [FromBody] MedicineCategorySingleFilter request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                MedicineCategoryViewModel? result = await bus.QueryAsync(new GetMedicineCategoryByIdQuery(request.Id));

                return Results.Ok(new ResponseMessage<MedicineCategoryViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchMedicineCategory")
            .WithSummary("Retrieve a medicine category record.")
            .Produces<ResponseMessage<MedicineCategoryViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<MedicineCategoryViewModel?>>(StatusCodes.Status400BadRequest);
            #endregion
        }
    }
}
