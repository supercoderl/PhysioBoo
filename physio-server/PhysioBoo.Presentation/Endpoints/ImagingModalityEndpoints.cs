using PhysioBoo.Application.Commands.ImagingModalities.CreateImagingModality;
using PhysioBoo.Application.ViewModels.ImagingModalities;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class ImagingModalityEndpoints
    {
        public static void MapImagingModalityEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/imaging-modalities")
                .WithTags("Imaging Modalities")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create imaging modality
            group.MapPost("/create", async (
                CreateImagingModalityViewModel newImagingModality,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateImagingModalityCommand(newImagingModality));

                return Results.Created($"/api/imaging-modalities/{newImagingModality.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newImagingModality.Id
                });
            }).WithName("CreateImagingModality")
            .WithSummary("Create new imaging modality")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
