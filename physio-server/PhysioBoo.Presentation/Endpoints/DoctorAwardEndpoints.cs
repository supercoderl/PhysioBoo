using MediatR;
using PhysioBoo.Application.Commands.DoctorAwards.CreateDoctorAward;
using PhysioBoo.Application.ViewModels.DoctorAwards;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class DoctorAwardEndpoints
    {
        public static void MapDoctorAwardEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/doctor-awards")
                .WithTags("Doctor Awards")
                .WithOpenApi();

            // Create doctor award
            group.MapPost("/create", async (
                CreateDoctorAwardViewModel newDoctorAward,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                DomainNotificationHandler notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreateDoctorAwardCommand(newDoctorAward));

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
