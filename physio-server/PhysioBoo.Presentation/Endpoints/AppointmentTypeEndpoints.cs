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
            group.MapPost("/create", async (
                CreateAppointmentTypeViewModel newAppointmentType,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateAppointmentTypeCommand(newAppointmentType));

                return Results.Created($"/api/appointment-types/{newAppointmentType.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newAppointmentType.Id
                });
            }).WithName("CreateAppointmentType")
            .WithSummary("Create new appointment type")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
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
            group.MapPost("/delete", async (
                DeleteAppointmentTypeViewModel request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new DeleteAppointmentTypeCommand(request.Id, request.IsHard));

                return Results.Ok(new ResponseMessage<string>
                {
                    Success = true,
                    Data = "Appointment type has been deleted successfully."
                });
            }).WithName("DeleteAppointmentType")
            .WithSummary("Handles requests to delete a specific record by its identifier and returns the appropriate result after the operation.")
            .Produces<ResponseMessage<string>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<string>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Update Appointment Type
            group.MapPost("/update", async (
                UpdateAppointmentTypeViewModel appointmentType,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new UpdateAppointmentTypeCommand(appointmentType));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = appointmentType.Id
                });
            }).WithName("UpdateAppointmentType")
            .WithSummary("Update appointment type")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Get Appointment Type By Id
            group.MapPost("/search-by-id", async (
                [FromBody] AppointmentTypeSingleFilter request,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                AppointmentTypeViewModel? result = await bus.QueryAsync(new GetAppointmentTypeByIdQuery(request.Id));

                return Results.Ok(new ResponseMessage<AppointmentTypeViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchAppointmentType")
            .WithSummary("Retrieve a appointment type record.")
            .Produces<ResponseMessage<AppointmentTypeViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<AppointmentTypeViewModel?>>(StatusCodes.Status400BadRequest);
            #endregion
        }
    }
}
