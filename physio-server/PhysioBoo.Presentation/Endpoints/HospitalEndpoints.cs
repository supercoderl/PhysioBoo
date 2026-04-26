using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.Hospitals.CreateHospital;
using PhysioBoo.Application.Commands.Hospitals.DeleteHospital;
using PhysioBoo.Application.Commands.Hospitals.UpdateHospital;
using PhysioBoo.Application.Queries.Hospitals.GetAll;
using PhysioBoo.Application.Queries.Hospitals.GetById;
using PhysioBoo.Application.ViewModels.Hospitals;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class HospitalEndpoints
    {
        public static void MapHospitalEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/hospitals")
                .WithTags("Hospitals")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Create New Hospital
            group.MapPost("", async (
                [FromBody] CreateHospitalViewModel request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                Guid newId = Guid.NewGuid();
                await bus.SendCommandAsync(new CreateHospitalCommand(request, newId));

                return Results.CreatedAtRoute(
                    "GetHospitalById",
                    new { id = newId },
                    new ResponseMessage<Guid>
                    {
                        Success = true,
                        Data = newId
                    }
                );
            }).WithName("CreateHospital")
            .WithSummary("Create new hospital")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion

            #region Get All Hospitals
            group.MapPost("search", async (
                [FromBody] PagedRequest<HospitalFilter> request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                PagedResult<HospitalViewModel> result = await bus.QueryAsync(new GetAllHospitalsQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<HospitalViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetHospitals")
            .WithSummary("Retrieve a paginated list of hospitals with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<HospitalViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<HospitalViewModel>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion

            #region Delete Hospital
            group.MapDelete("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new DeleteHospitalCommand(id));

                return Results.NoContent();
            }).WithName("DeleteHospital")
            .WithSummary("Handles requests to delete a specific hospital by its identifier.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion

            #region Update Hospital
            group.MapPatch("{id:guid}", async (
                Guid id,
                [FromBody] UpdateHospitalViewModel request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new UpdateHospitalCommand(request, id));

                return Results.NoContent();
            }).WithName("UpdateHospital")
            .WithSummary("Update hospital")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .RequireAuthorization();
            #endregion

            #region Get Hospital By Id
            group.MapGet("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                HospitalViewModel? result = await bus.QueryAsync(new GetHospitalByIdQuery(id));

                return Results.Ok(new ResponseMessage<HospitalViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetHospitalById")
            .WithSummary("Retrieve a hospital record.")
            .Produces<ResponseMessage<HospitalViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<HospitalViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion
        }
    }
}
