using MediatR;
using PhysioBoo.Application.Commands.Hospitals.CreateHospital;
using PhysioBoo.Application.ViewModels.Hospitals;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class HospitalEndpoints
    {
        public static void MapHospitalEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("api/hospitals")
                .WithTags("Hospitals")
                .WithOpenApi();

            // Create hospital
            group.MapPost("/create", async (
                CreateHospitalViewModel newHospital,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                var notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreateHospitalCommand(newHospital));

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
