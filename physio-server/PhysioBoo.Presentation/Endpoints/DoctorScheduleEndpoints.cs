using PhysioBoo.Application.Commands.DoctorSchedules.CreateDoctorSchedule;
using PhysioBoo.Application.ViewModels.DoctorSchedules;





namespace PhysioBoo.Presentation.Endpoints
{
    public static class DoctorScheduleEndpoints
    {
        public static void MapDoctorScheduleEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/doctor-schedules")
                .WithTags("Doctor Schedules")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create doctor schedule
            group.MapPost("/create", async (
                CreateDoctorScheduleViewModel newDoctorSchedule,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new CreateDoctorScheduleCommand(newDoctorSchedule));

                return Results.Created($"/api/doctor-schedules/{newDoctorSchedule.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newDoctorSchedule.Id
                });
            }).WithName("CreateDoctorSchedule")
            .WithSummary("Create new doctor schedule")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Scheduling.DoctorScheduleCreate);
        }
    }
}
