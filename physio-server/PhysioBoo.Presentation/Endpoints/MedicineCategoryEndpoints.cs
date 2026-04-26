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
            group.MapPost("", async (
                [FromBody] CreateMedicineCategoryViewModel request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                Guid newId = Guid.NewGuid();
                await bus.SendCommandAsync(new CreateMedicineCategoryCommand(request, newId));

                return Results.CreatedAtRoute(
                    "GetMedicineCategoryById",
                    new { id = newId },
                    new ResponseMessage<Guid>
                    {
                        Success = true,
                        Data = newId
                    }
                );
            }).WithName("CreateMedicineCategory")
            .WithSummary("Create new medicine category")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion

            #region Get All Medicine Categories
            group.MapPost("search", async (
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
            }).WithName("GetMedicineCategories")
            .WithSummary("Retrieve a paginated list of medicine categories with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<MedicineCategoryViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<MedicineCategoryViewModel>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion

            #region Delete Medicine Category
            group.MapDelete("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new DeleteMedicineCategoryCommand(id));

                return Results.NoContent();
            }).WithName("DeleteMedicineCategory")
            .WithSummary("Handles requests to delete a specific medicine category by its identifier.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion

            #region Update Medicine Category
            group.MapPatch("{id:guid}", async (
                Guid id,
                [FromBody] UpdateMedicineCategoryViewModel request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new UpdateMedicineCategoryCommand(request, id));

                return Results.NoContent();
            }).WithName("UpdateMedicineCategory")
            .WithSummary("Update medicine category")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .RequireAuthorization();
            #endregion

            #region Get Medicine Category By Id
            group.MapGet("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                MedicineCategoryViewModel? result = await bus.QueryAsync(new GetMedicineCategoryByIdQuery(id));

                return Results.Ok(new ResponseMessage<MedicineCategoryViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetMedicineCategoryById")
            .WithSummary("Retrieve a medicine category record.")
            .Produces<ResponseMessage<MedicineCategoryViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<MedicineCategoryViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion
        }
    }
}
