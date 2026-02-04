using PhysioBoo.Application.Commands.Hospitals.CreateHospital;
using PhysioBoo.Application.ViewModels.Hospitals;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

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

            // Create hospital
            group.MapPost("/create", async (
                CreateHospitalViewModel newHospital,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateHospitalCommand(newHospital));

                return Results.Created($"/api/hospitals/{newHospital.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newHospital.Id
                });
            }).WithName("CreateHospital")
            .WithSummary("Create new hospital")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
