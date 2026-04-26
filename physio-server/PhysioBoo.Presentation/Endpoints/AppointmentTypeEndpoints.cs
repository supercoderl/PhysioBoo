using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.AppointmentTypes.CreateAppointmentType;
using PhysioBoo.Application.Commands.AppointmentTypes.DeleteAppointmentType;
using PhysioBoo.Application.Commands.AppointmentTypes.UpdateAppointmentType;
using PhysioBoo.Application.Queries.AppointmentTypes.GetAll;
using PhysioBoo.Application.Queries.AppointmentTypes.GetById;
using PhysioBoo.Application.ViewModels.AppointmentTypes;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class AppointmentTypeEndpoints
    {
        public static void MapAppointmentTypeEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/appointment-types")
                .WithTags("Appointment Types")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Create New Appointment Type
            group.MapPost("", async (
                [FromBody] CreateAppointmentTypeViewModel newAppointmentType,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                Guid newId = Guid.NewGuid();

                await bus.SendCommandAsync(new CreateAppointmentTypeCommand(newAppointmentType, newId));

                return Results.CreatedAtRoute(
                    "GetAppointmentTypeById",
                    new { id = newId },
                    new ResponseMessage<Guid>
                    {
                        Success = true,
                        Data = newId
                    }
                );
            }).WithName("CreateAppointmentType")
            .WithSummary("Create new appointment type")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion

            #region Get All Appointment Types
            group.MapPost("/search", async (
                [FromBody] PagedRequest<AppointmentTypeFilter> request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                PagedResult<AppointmentTypeViewModel> result = await bus.QueryAsync(new GetAllAppointmentTypesQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<AppointmentTypeViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchAppointmentTypes")
            .WithSummary("Retrieve a paginated list of appointment types with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<AppointmentTypeViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<AppointmentTypeViewModel>>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Delete AppointmentType
            group.MapDelete("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new DeleteAppointmentTypeCommand(id));

                return Results.NoContent();
            }).WithName("DeleteAppointmentType")
            .WithSummary("Handles requests to delete a specific record by its identifier and returns the appropriate result after the operation.")
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .RequireAuthorization();
            #endregion

            #region Update Appointment Type
            group.MapPatch("{id:guid}", async (
                Guid id,
                [FromBody] UpdateAppointmentTypeViewModel appointmentType,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new UpdateAppointmentTypeCommand(appointmentType, id));

                return Results.NoContent;
            }).WithName("UpdateAppointmentType")
            .WithSummary("Update appointment type")
            .Produces(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .RequireAuthorization();
            #endregion

            #region Get Appointment Type By Id
            group.MapGet("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                AppointmentTypeViewModel? result = await bus.QueryAsync(new GetAppointmentTypeByIdQuery(id));

                return Results.Ok(new ResponseMessage<AppointmentTypeViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetAppointmentTypeById")
            .WithSummary("Retrieve a appointment type record.")
            .Produces<ResponseMessage<AppointmentTypeViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<AppointmentTypeViewModel?>>(StatusCodes.Status400BadRequest)
            .Produces<ResponseMessage<AppointmentTypeViewModel?>>(StatusCodes.Status404NotFound);
            #endregion
        }
    }
}
