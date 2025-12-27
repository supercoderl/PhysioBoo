using MediatR;
using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Queries.AdminMenus.GetAll;
using PhysioBoo.Application.ViewModels.AdminMenus;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
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
                .WithOpenApi();

            #region Get All AdminMenus
            group.MapPost("/search", async (
                [FromBody] PagedRequest<AdminMenuFilter> request,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                DomainNotificationHandler notifications = (DomainNotificationHandler)handler;

                PagedResult<AdminMenuViewModel> result = await bus.QueryAsync(new GetAllAdminMenusQuery(request));

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

                return Results.Ok(new ResponseMessage<PagedResult<AdminMenuViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchAdminMenus")
            .WithSummary("Retrieve a paginated list of menus with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<AdminMenuViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<AdminMenuViewModel>>>(StatusCodes.Status400BadRequest);
            #endregion
        }
    }
}
