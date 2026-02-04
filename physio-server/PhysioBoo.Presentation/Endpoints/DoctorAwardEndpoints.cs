using PhysioBoo.Application.Commands.DoctorAwards.CreateDoctorAward;
using PhysioBoo.Application.ViewModels.DoctorAwards;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class DoctorAwardEndpoints
    {
        public static void MapDoctorAwardEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/doctor-awards")
                .WithTags("Doctor Awards")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create doctor award
            group.MapPost("/create", async (
                CreateDoctorAwardViewModel newDoctorAward,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateDoctorAwardCommand(newDoctorAward));

                return Results.Created($"/api/doctor-awards/{newDoctorAward.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newDoctorAward.Id
                });
            }).WithName("CreateDoctorAward")
            .WithSummary("Create new doctor award")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
