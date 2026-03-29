using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.HospitalGroups.CreateHospitalGroup;
using PhysioBoo.Application.Commands.HospitalGroups.DeleteHospitalGroup;
using PhysioBoo.Application.Commands.HospitalGroups.UpdateHospitalGroup;
using PhysioBoo.Application.Queries.HospitalGroups.GetAll;
using PhysioBoo.Application.Queries.HospitalGroups.GetById;
using PhysioBoo.Application.ViewModels.HospitalGroups;
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
            group.MapPost("/create", async (
                CreateHospitalGroupViewModel newHospitalGroup,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateHospitalGroupCommand(newHospitalGroup));

                return Results.Created($"/api/hospital-groups/{newHospitalGroup.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newHospitalGroup.Id
                });
            }).WithName("CreateHospitalGroup")
            .WithSummary("Create new hospital group")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Get All Hospital Groups
            group.MapPost("/search", async (
                [FromBody] PagedRequest<HospitalGroupFilter> request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                PagedResult<HospitalGroupViewModel> result = await bus.QueryAsync(new GetAllHospitalGroupsQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<HospitalGroupViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchHospitalGroups")
            .WithSummary("Retrieve a paginated list of hospital groups with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<HospitalGroupViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<HospitalGroupViewModel>>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Delete Hospital Groups
            group.MapPost("/delete", async (
                DeleteHospitalGroupViewModel request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new DeleteHospitalGroupCommand(request.Id, request.IsHard));

                return Results.Ok(new ResponseMessage<string>
                {
                    Success = true,
                    Data = "Hospital group has been deleted successfully."
                });
            }).WithName("DeleteHospitalGroup")
            .WithSummary("Handles requests to delete a specific record by its identifier and returns the appropriate result after the operation.")
            .Produces<ResponseMessage<string>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<string>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Update Hospital Group
            group.MapPost("/update", async (
                UpdateHospitalGroupViewModel HospitalGroup,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new UpdateHospitalGroupCommand(HospitalGroup));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = HospitalGroup.Id
                });
            }).WithName("UpdateHospitalGroup")
            .WithSummary("Update hospital group")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Get Hospital Group By Id
            group.MapPost("/search-by-id", async (
                [FromBody] HospitalGroupSingleFilter request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                HospitalGroupViewModel? result = await bus.QueryAsync(new GetHospitalGroupByIdQuery(request.Id));

                return Results.Ok(new ResponseMessage<HospitalGroupViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchHospitalGroup")
            .WithSummary("Retrieve a hospital group record.")
            .Produces<ResponseMessage<HospitalGroupViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<HospitalGroupViewModel?>>(StatusCodes.Status400BadRequest);
            #endregion
        }
    }
}
