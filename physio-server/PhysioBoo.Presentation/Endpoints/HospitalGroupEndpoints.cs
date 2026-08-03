using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.HospitalGroups.CreateHospitalGroup;
using PhysioBoo.Application.Commands.HospitalGroups.DeleteHospitalGroup;
using PhysioBoo.Application.Commands.HospitalGroups.UpdateHospitalGroup;
using PhysioBoo.Application.Queries.HospitalGroups.GetAll;
using PhysioBoo.Application.Queries.HospitalGroups.GetById;
using PhysioBoo.Application.ViewModels.HospitalGroups;
using PhysioBoo.Domain.Constants;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class HospitalGroupEndpoints
    {
        public static void MapHospitalGroupEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/hospital-groups")
                .WithTags("Hospital Groups")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Create New Hospital Group
            group.MapPost("", async (
                [FromBody] CreateHospitalGroupViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                Guid newId = Guid.NewGuid();
                await bus.SendCommandAsync(new CreateHospitalGroupCommand(request, newId));

                return Results.CreatedAtRoute(
                    "GetHospitalGroupById",
                    new { id = newId },
                    new ResponseMessage<Guid>
                    {
                        Success = true,
                        Data = newId
                    }
                );
            }).WithName("CreateHospitalGroup")
            .WithSummary("Create new hospital group")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Admin.HospitalGroupCreate);
            #endregion

            #region Get All Hospital Groups
            group.MapPost("search", async (
                [FromBody] PagedRequest<HospitalGroupFilter> request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedResult<HospitalGroupViewModel> result = await bus.QueryAsync(new GetAllHospitalGroupsQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<HospitalGroupViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetHospitalGroups")
            .WithSummary("Retrieve a paginated list of hospital groups with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<HospitalGroupViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<HospitalGroupViewModel>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Admin.HospitalGroupRead);
            #endregion

            #region Delete Hospital Group
            group.MapDelete("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new DeleteHospitalGroupCommand(id));

                return Results.NoContent();
            }).WithName("DeleteHospitalGroup")
            .WithSummary("Handles requests to delete a specific hospital group by its identifier.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Admin.HospitalGroupDelete);
            #endregion

            #region Update Hospital Group
            group.MapPatch("{id:guid}", async (
                Guid id,
                [FromBody] UpdateHospitalGroupViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new UpdateHospitalGroupCommand(request, id));

                return Results.NoContent();
            }).WithName("UpdateHospitalGroup")
            .WithSummary("Update hospital group")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Admin.HospitalGroupUpdate);
            #endregion

            #region Get Hospital Group By Id
            group.MapGet("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                HospitalGroupViewModel? result = await bus.QueryAsync(new GetHospitalGroupByIdQuery(id));

                return Results.Ok(new ResponseMessage<HospitalGroupViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetHospitalGroupById")
            .WithSummary("Retrieve a hospital group record.")
            .Produces<ResponseMessage<HospitalGroupViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<HospitalGroupViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Admin.HospitalGroupRead);
            #endregion
        }
    }
}
