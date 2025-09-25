using MediatR;
using PhysioBoo.Application.Commands.Manufacturers.CreateManufacturer;
using PhysioBoo.Application.ViewModels.Manufacturers;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class ManufacturerEndpoints
    {
        public static void MapManufacturerEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("api/manufacturers")
                .WithTags("Manufacturers")
                .WithOpenApi();

            // Create manufacturer
            group.MapPost("/create", async (
                CreateManufacturerViewModel newManufacturer,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                var notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreateManufacturerCommand(newManufacturer));

                if (notifications.HasNotifications())
                {
                    return Results.BadRequest(new ResponseMessage<Guid>
                    {
                        Success = false,
                        Errors = notifications.GetNotifications().Select(n => n.Value),
                        DetailedErrors = notifications.GetNotifications().Select(n => new DetailedError
                        {
                            Code = n.Code,
                            Data = n.Data
                        })
                    });
                }

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
