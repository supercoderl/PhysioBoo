using PhysioBoo.Application.Commands.DoctorLeaves.CreateDoctorLeave;
using PhysioBoo.Application.ViewModels.DoctorLeaves;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class DoctorLeaveEndpoints
    {
        public static void MapDoctorLeaveEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/doctor-leaves")
                .WithTags("Doctor Leaves")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create doctor leave
            group.MapPost("/create", async (
                CreateDoctorLeaveViewModel newDoctorLeave,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateDoctorLeaveCommand(newDoctorLeave));

                return Results.Created($"/api/doctor-leaves/{newDoctorLeave.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newDoctorLeave.Id
                });
            }).WithName("CreateDoctorLeave")
            .WithSummary("Create new doctor leave")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
