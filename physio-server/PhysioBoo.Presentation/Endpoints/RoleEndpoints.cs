using MediatR;
using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.Roles.AssignPermissionToRole;
using PhysioBoo.Application.Commands.Roles.CreateRole;
using PhysioBoo.Application.Queries.Roles.GetAll;
using PhysioBoo.Application.ViewModels.Roles;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
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
                .WithOpenApi();

            #region Create Role
            group.MapPost("/create", async (
                [FromBody] CreateRoleViewModel newRole,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                IUser user,

                CancellationToken cancellationToken
            ) =>
            {
                DomainNotificationHandler notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreateRoleCommand(newRole, user.GetUserId()));

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
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                DomainNotificationHandler notifications = (DomainNotificationHandler)handler;

                PagedResult<RoleViewModel> result = await bus.QueryAsync(new GetAllRolesQuery(request));

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
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                DomainNotificationHandler notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new AssignPermissionToRoleCommand(permissionForAssigning));

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
