using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.Permissions.CreatePermission;
using PhysioBoo.Application.Commands.Permissions.DeletePermission;
using PhysioBoo.Application.Commands.Permissions.UpdatePermission;
using PhysioBoo.Application.Queries.Permissions.GetAll;
using PhysioBoo.Application.ViewModels.Permissions;
using PhysioBoo.Domain.Constants;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class PermissionEndpoints
    {
        public static void MapPermissionEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/permissions")
                .WithTags("Permission")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Create Permission
            group.MapPost("", async (
                [FromBody] CreatePermissionViewModel newPermission,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                Guid newId = Guid.NewGuid();

                await bus.SendCommandAsync(new CreatePermissionCommand(newId, newPermission));

                return Results.CreatedAtRoute(
                "GetPermissionById",
                    new { id = newId },
                    new ResponseMessage<Guid>
                    {
                        Success = true,
                        Data = newId
                    }
                );
            }).WithName("CreatPermission")
            .WithSummary("Create new Permission")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Iam.PermissionCreate);
            #endregion

            #region Get All Permissions
            group.MapPost("/search", async (
                [FromBody] PagedRequest<PermissionFilter> request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedResult<PermissionViewModel> result = await bus.QueryAsync(new GetAllPermissionsQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<PermissionViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchPermissions")
            .WithSummary("Retrieve a paginated list of Permissions with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<PermissionViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<PermissionViewModel>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Iam.PermissionRead);
            #endregion

            #region Delete Permission
            group.MapDelete("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new DeletePermissionCommand(id));

                return Results.NoContent();
            }).WithName("DeletePermission")
            .WithSummary("Handles requests to delete a permission by its identifier.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Iam.PermissionDelete);
            #endregion

            #region Update Permission
            group.MapPatch("{id:guid}", async (
                Guid id,
                [FromBody] UpdatePermissionViewModel permission,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new UpdatePermissionCommand(id, permission));

                return Results.NoContent();
            }).WithName("UpdatePermission")
            .WithSummary("Update permission")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Iam.PermissionUpdate);
            #endregion
        }
    }
}
