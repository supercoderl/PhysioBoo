using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.Roles.AssignPermissionToRole;
using PhysioBoo.Application.Commands.Roles.CreateRole;
using PhysioBoo.Application.Queries.Roles.GetAll;
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
                IUser user,

                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateRoleCommand(newRole, user.GetUserId()));

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
        }
    }
}
