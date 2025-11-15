using MediatR;
using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.Permissions.CreatePermission;
using PhysioBoo.Application.Queries.Permissions.GetAll;
using PhysioBoo.Application.ViewModels.Permissions;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
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
                .WithOpenApi();

            // Create Permission
            group.MapPost("/create", async (
                [FromBody] CreatePermissionViewModel newPermission,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                DomainNotificationHandler notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreatePermissionCommand(newPermission));

                if (notifications.HasNotifications())
                {
                    return Results.BadRequest(new ResponseMessage<Guid>
                    {
                        Success = false,
                        Errors = notifications.GetNotifications().Select(n => n.Value),
                        DetailedErrors = notifications.GetNotifications().Select(n => new DetailedError
                        {
                            Code = n.Code,
                            Data = n.Data
                        })
                    });
                }

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
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                DomainNotificationHandler notifications = (DomainNotificationHandler)handler;

                PagedResult<PermissionViewModel> result = await bus.QueryAsync(new GetAllPermissionsQuery(request));

                if (notifications.HasNotifications())
                {
                    return Results.BadRequest(new ResponseMessage<Guid>
                    {
                        Success = false,
                        Errors = notifications.GetNotifications().Select(n => n.Value),
                        DetailedErrors = notifications.GetNotifications().Select(n => new DetailedError
                        {
                            Code = n.Code,
                            Data = n.Data
                        })
                    });
                }

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
