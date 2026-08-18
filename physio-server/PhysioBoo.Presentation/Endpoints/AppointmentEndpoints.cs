using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.Appointments.ChangeStatusAppointment;
using PhysioBoo.Application.Commands.Appointments.CreateAppointment;
using PhysioBoo.Application.Queries.Appointments.GetAll;
using PhysioBoo.Application.Queries.Appointments.GetById;
using PhysioBoo.Application.Queries.Appointments.GetDaily;
using PhysioBoo.Application.ViewModels.Appointments;
using PhysioBoo.Domain.Constants;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class AppointmentEndpoints
    {
        public static void MapAppointmentEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/appointments")
                .WithTags("Appointments")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Create New Appointment
            group.MapPost("", async (
                [FromBody] CreateAppointmentViewModel newAppointment,
                IMediatorHandler bus,
                IUser user,
                CancellationToken ct
            ) =>
            {
                Guid newId = Guid.NewGuid();

                await bus.SendCommandAsync(new CreateAppointmentCommand(newAppointment, newId));

                return Results.CreatedAtRoute(
                    "GetAppointmentById",
                    new { id = newId },
                    new ResponseMessage<Guid>
                    {
                        Success = true,
                        Data = newId
                    }
                );
            }).WithName("CreateAppointment")
            .WithSummary("Create new appointment")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Scheduling.AppointmentCreate);
            #endregion

            #region Get All Appointments
            group.MapPost("search", async (
                [FromBody] PagedRequest<AppointmentFilter> request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedResult<AppointmentViewModel> result = await bus.QueryAsync(new GetAllAppointmentsQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<AppointmentViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetAppointments")
            .WithSummary("Retrieve a paginated list of appointments with filters and sorting.")
            .Produces<ResponseMessage<PagedResult<AppointmentViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<AppointmentViewModel>>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Scheduling.AppointmentRead);
            #endregion

            #region Get Appointment By Id
            group.MapGet("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                AppointmentViewModel? result = await bus.QueryAsync(new GetAppointmentByIdQuery(id));

                return Results.Ok(new ResponseMessage<AppointmentViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetAppointmentById")
            .WithSummary("Retrieve a appointment record.")
            .Produces<ResponseMessage<AppointmentViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<AppointmentViewModel?>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Scheduling.AppointmentRead);
            #endregion

            #region Update Status
            group.MapPatch("{id:guid}/status", async (
                Guid id,
                [FromBody] UpdateAppointmentStatusViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new ChangeStatusAppointmentCommand(id, request));
                return Results.NoContent();
            }).WithName("UpdateAppointmentStatus")
            .WithSummary("update a appointment record status.")
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Scheduling.AppointmentUpdate);
            #endregion

            #region Doctor Daily Schedule
            group.MapGet("doctor/{doctorId:guid}/daily", async (
                Guid doctorId,
                [FromQuery] string date,
                IMediatorHandler bus, CancellationToken ct) =>
            {
                List<AppointmentViewModel> result = await bus.QueryAsync(
                    new GetDoctorDailyScheduleQuery(doctorId, date));
                return Results.Ok(new ResponseMessage<List<AppointmentViewModel>>
                {
                    Success = true,
                    Data = result
                });
            })
            .WithName("GetDoctorDailySchedule")
            .WithSummary("get a list appointment record from daily.")
            .RequireAuthorization(Permissions.Scheduling.AppointmentRead);
            #endregion

            #region Complete Consultation
            group.MapPatch("{id:guid}/complete", async (
                Guid id,
                [FromBody] CompleteConsultationViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new CompleteConsultationCommand(id, request));
                return Results.NoContent();
            })
            .WithName("CompleteConsultation")
            .WithSummary("")
            .RequireAuthorization(Permissions.Scheduling.EncounterComplete);
            #endregion
        }
    }
}
