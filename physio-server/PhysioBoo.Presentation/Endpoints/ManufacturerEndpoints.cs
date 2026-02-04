using PhysioBoo.Application.Commands.Manufacturers.CreateManufacturer;
using PhysioBoo.Application.ViewModels.Manufacturers;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class ManufacturerEndpoints
    {
        public static void MapManufacturerEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/manufacturers")
                .WithTags("Manufacturers")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create manufacturer
            group.MapPost("/create", async (
                CreateManufacturerViewModel newManufacturer,
                IMediatorHandler bus,
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateManufacturerCommand(newManufacturer));

                return Results.Created($"/api/manufacturers/{newManufacturer.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newManufacturer.Id
                });
            }).WithName("CreateManufacturer")
            .WithSummary("Create new manufacturer")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
