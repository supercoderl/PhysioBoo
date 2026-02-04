using PhysioBoo.Application.Commands.Doctors.CreateDoctor;
using PhysioBoo.Application.ViewModels.Doctors;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

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

            // Create doctor
            group.MapPost("/create", async (
                CreateDoctorViewModel newDoctor,
                IMediatorHandler bus,
                IUser user,
                CancellationToken cancellationToken
            ) =>
            {
                Guid id = user.GetUserId();

                await bus.SendCommandAsync(new CreateDoctorCommand(id, newDoctor));

                return Results.Created($"/api/doctors/create/{id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = id
                });
            }).WithName("CreateDoctor")
            .WithSummary("Create new doctor information")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
        }
    }
}
