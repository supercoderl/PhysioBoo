using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.AdminMenus.CreateAdminMenu;
using PhysioBoo.Application.Commands.AdminMenus.DeleteAdminMenu;
using PhysioBoo.Application.Commands.AdminMenus.UpdateAdminMenu;
using PhysioBoo.Application.Queries.AdminMenus.GetAll;
using PhysioBoo.Application.Queries.AdminMenus.GetById;
using PhysioBoo.Application.Queries.AdminMenus.GetMine;
using PhysioBoo.Application.ViewModels.AdminMenus;
using PhysioBoo.Application.ViewModels.Users;
using PhysioBoo.Domain.Constants;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class AdminMenuEndpoints
    {
        public static void MapAdminMenuEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/admin-menus")
                .WithTags("Admin Menu")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Get All AdminMenus
            group.MapPost("/search", async (
                [FromBody] PagedRequest<AdminMenuFilter> request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedResult<AdminMenuViewModel> result = await bus.QueryAsync(new GetAllAdminMenusQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<AdminMenuViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetAdminMenus")
            .WithSummary("Retrieve a paginated list of menus with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<AdminMenuViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<AdminMenuViewModel>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Admin.AdminMenuRead);
            #endregion

            #region Create New Admin Menu
            group.MapPost("", async (
                [FromBody] CreateAdminMenuViewModel newAdminMenu,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                Guid newId = Guid.NewGuid();

                await bus.SendCommandAsync(new CreateAdminMenuCommand(newAdminMenu, newId));

                return Results.CreatedAtRoute(
                    "GetAdminMenuById",
                    new { id = newId },
                    new ResponseMessage<Guid>
                    {
                        Success = true,
                        Data = newId
                    }
                );
            }).WithName("CreateAdminMenu")
            .WithSummary("Create new admin menu")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Admin.AdminMenuCreate);
            #endregion

            #region Delete Admin Menu
            group.MapDelete("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new DeleteAdminMenuCommand(id));

                return Results.NoContent();
            }).WithName("DeleteAdminMenu")
            .WithSummary("Handles requests to delete a specific record by its identifier and returns the appropriate result after the operation.")
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Admin.AdminMenuDelete);
            #endregion

            #region Update Admin Menu
            group.MapPatch("{id:guid}", async (
                Guid id,
                [FromBody] UpdateAdminMenuViewModel adminMenu,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new UpdateAdminMenuCommand(adminMenu, id));

                return Results.NoContent();
            }).WithName("UpdateAdminMenu")
            .WithSummary("Update admin menu")
            .Produces(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Admin.AdminMenuUpdate);
            #endregion

            #region Get My Menus
            group.MapGet("/mine", async (
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                List<UserMenuViewModel> result = await bus.QueryAsync(new GetMyMenusQuery());

                return Results.Ok(new ResponseMessage<List<UserMenuViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetMyMenus")
            .WithSummary("Retrieve the current user's permission-filtered menu tree.")
            .Produces<ResponseMessage<List<UserMenuViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization();
            #endregion

            #region Get Admin Menu By Id
            group.MapGet("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                AdminMenuViewModel? result = await bus.QueryAsync(new GetAdminMenuByIdQuery(id));

                return Results.Ok(new ResponseMessage<AdminMenuViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetAdminMenuById")
            .WithSummary("Retrieve a admin menu record.")
            .Produces<ResponseMessage<AdminMenuViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<AdminMenuViewModel?>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<AdminMenuViewModel?>>(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Admin.AdminMenuRead);
            #endregion
        }
    }
}
