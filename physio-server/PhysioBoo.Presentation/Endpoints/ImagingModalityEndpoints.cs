using MediatR;
using PhysioBoo.Application.Commands.ImagingModalities.CreateImagingModality;
using PhysioBoo.Application.ViewModels.ImagingModalities;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class ImagingModalityEndpoints
    {
        public static void MapImagingModalityEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("api/imaging-modalities")
                .WithTags("Imaging Modalities")
                .WithOpenApi();

            // Create imaging modality
            group.MapPost("/create", async (
                CreateImagingModalityViewModel newImagingModality,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                var notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreateImagingModalityCommand(newImagingModality));

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
