using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Queries.AdminMenus.GetAll;
using PhysioBoo.Application.ViewModels.AdminMenus;
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
                CancellationToken cancellationToken
            ) =>
            {
                PagedResult<AdminMenuViewModel> result = await bus.QueryAsync(new GetAllAdminMenusQuery(request));

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
