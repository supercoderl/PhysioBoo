using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.Doctors.DeleteDoctor;
using PhysioBoo.Application.Commands.Doctors.UpdateDoctor;
using PhysioBoo.Application.Queries.Doctors.GetAll;
using PhysioBoo.Application.Queries.Doctors.GetById;
using PhysioBoo.Application.ViewModels.Doctors;
using PhysioBoo.Domain.Constants;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class DoctorEndpoints
    {
        public static void MapDoctorEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/doctors")
                .WithTags("Doctors")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Get All Doctors
            group.MapPost("search", async (
                [FromBody] PagedRequest<DoctorFilter> request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedResult<DoctorViewModel> result = await bus.QueryAsync(new GetAllDoctorsQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<DoctorViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetDoctors")
            .WithSummary("Retrieve a paginated list of doctors with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<DoctorViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<DoctorViewModel>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Hr.DoctorRead);
            #endregion

            #region Delete Doctor
            group.MapDelete("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new DeleteDoctorCommand(id));

                return Results.NoContent();
            }).WithName("DeleteDoctor")
            .WithSummary("Handles requests to delete a specific doctor by its identifier.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Hr.DoctorDelete);
            #endregion

            #region Update Doctor
            group.MapPatch("{id:guid}", async (
                Guid id,
                [FromBody] UpdateDoctorViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new UpdateDoctorCommand(request, id));

                return Results.NoContent();
            }).WithName("UpdateDoctor")
            .WithSummary("Update doctor")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Hr.DoctorUpdate);
            #endregion

            #region Get Doctor By Id
            group.MapGet("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                DoctorViewModel? result = await bus.QueryAsync(new GetDoctorByIdQuery(id));

                return Results.Ok(new ResponseMessage<DoctorViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetDoctorById")
            .WithSummary("Retrieve a doctor record.")
            .Produces<ResponseMessage<DoctorViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<DoctorViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Hr.DoctorRead);
            #endregion
        }
    }
}
