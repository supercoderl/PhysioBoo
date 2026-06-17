using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.Roles.AssignPermissionToRole;
using PhysioBoo.Application.Commands.Roles.CreateRole;
using PhysioBoo.Application.Commands.Roles.DeletePermissionFromRole;
using PhysioBoo.Application.Commands.Roles.DeleteRole;
using PhysioBoo.Application.Commands.Roles.UpdateRole;
using PhysioBoo.Application.Queries.Roles.GetAll;
using PhysioBoo.Application.Queries.Roles.GetById;
using PhysioBoo.Application.Queries.Roles.GetPermissionsByRole;
using PhysioBoo.Application.ViewModels.Roles;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class RoleEndpoints
    {
        public static void MapRoleEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/roles")
                .WithTags("Role")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Create Role
            group.MapPost("/create", async (
                [FromBody] CreateRoleViewModel newRole,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateRoleCommand(newRole));

                return Results.Created($"/api/roles/{newRole.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newRole.Id
                });
            }).WithName("CreateRole")
            .WithSummary("Create new Role")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion

            #region Get All Roles
            group.MapPost("/search", async (
                [FromBody] PagedRequest<RoleFilter> request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                PagedResult<RoleViewModel> result = await bus.QueryAsync(new GetAllRolesQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<RoleViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchRoles")
            .WithSummary("Retrieve a paginated list of Roles with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<RoleViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<RoleViewModel>>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Assign Permission To Role
            group.MapPost("/assign-permission-to-role", async (
                [FromBody] PermissionForAssigningViewModel permissionForAssigning,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new AssignPermissionToRoleCommand(permissionForAssigning));

                return Results.Ok();
            }).WithName("AssignPermissionToRole")
            .WithSummary("Assign Permission To Role")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion

            #region Delete Role
            group.MapDelete("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new DeleteRoleCommand(id));

                return Results.NoContent();
            }).WithName("DeleteRole")
            .WithSummary("Handles requests to delete a specific role by its identifier.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion

            #region Delete Permission From Role
            group.MapDelete("{id:guid}/permissions/{permId:guid}", async (
                Guid id,
                Guid permId,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new DeletePermissionFromRoleCommand(id, permId));

                return Results.NoContent();
            }).WithName("DeletePermissionFromRole")
            .WithSummary("Handles requests to delete a specific permission from role by its identifier.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion

            #region Update Role
            group.MapPatch("{id:guid}", async (
                Guid id,
                [FromBody] UpdateRoleViewModel role,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new UpdateRoleCommand(id, role));

                return Results.NoContent();
            }).WithName("UpdateRole")
            .WithSummary("Update role")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .RequireAuthorization();
            #endregion

            #region Get Role By Id
            group.MapGet("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                RoleViewModel? result = await bus.QueryAsync(new GetRoleByIdQuery(id));

                return Results.Ok(new ResponseMessage<RoleViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetRoleById")
            .WithSummary("Retrieve a role record.")
            .Produces<ResponseMessage<RoleViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<RoleViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion

            #region Get Permissions By Role
            group.MapGet("{id:guid}/permissions", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                IEnumerable<string> result = await bus.QueryAsync(new GetPermissionsByRoleQuery(id));

                return Results.Ok(new ResponseMessage<IEnumerable<string>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetPermissionsByRole")
            .WithSummary("Retrieve a list of permission records by role.")
            .Produces<ResponseMessage<IEnumerable<string>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<IEnumerable<string>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion
        }
    }
}
