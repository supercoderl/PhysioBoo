using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.Permissions.CreatePermission;
using PhysioBoo.Application.Queries.Permissions.GetAll;
using PhysioBoo.Application.ViewModels.Permissions;
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
            RouteGroupBuilder group = app.MapGroup("api/Permissions")
                .WithTags("Permission")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create Permission
            group.MapPost("/create", async (
                [FromBody] CreatePermissionViewModel newPermission,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreatePermissionCommand(newPermission));

                return Results.Created($"/api/Permissions/{newPermission.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newPermission.Id
                });
            }).WithName("CreatPermission")
            .WithSummary("Create new Permission")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();

            #region Get All Permissions
            group.MapPost("/search", async (
                [FromBody] PagedRequest<PermissionFilter> request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
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
            .Produces<ResponseMessage<PagedResult<PermissionViewModel>>>(StatusCodes.Status400BadRequest);
            #endregion
        }
    }
}
