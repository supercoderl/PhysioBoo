using PhysioBoo.Application.Commands.DoctorPublications.CreateDoctorPublication;
using PhysioBoo.Application.ViewModels.DoctorPublications;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class DoctorPublicationEndpoints
    {
        public static void MapDoctorPublicationEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/doctor-publications")
                .WithTags("Doctor Publications")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create doctor publication
            group.MapPost("/create", async (
                CreateDoctorPublicationViewModel newDoctorPublication,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateDoctorPublicationCommand(newDoctorPublication));

                return Results.Created($"/api/doctor-publications/{newDoctorPublication.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newDoctorPublication.Id
                });
            }).WithName("CreateDoctorPublication")
            .WithSummary("Create new doctor publication")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
