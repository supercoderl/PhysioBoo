using MediatR;
using PhysioBoo.Application.Commands.DoctorPublications.CreateDoctorPublication;
using PhysioBoo.Application.ViewModels.DoctorPublications;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class DoctorPublicationEndpoints
    {
        public static void MapDoctorPublicationEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/doctor-publications")
                .WithTags("Doctor Publications")
                .WithOpenApi();

            // Create doctor publication
            group.MapPost("/create", async (
                CreateDoctorPublicationViewModel newDoctorPublication,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                DomainNotificationHandler notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreateDoctorPublicationCommand(newDoctorPublication));

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
