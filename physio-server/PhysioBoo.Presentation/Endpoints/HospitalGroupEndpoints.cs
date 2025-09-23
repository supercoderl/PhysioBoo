using MediatR;
using PhysioBoo.Application.Commands.HospitalGroups.CreateHospitalGroup;
using PhysioBoo.Application.ViewModels.HospitalGroups;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class HospitalGroupEndpoints
    {
        public static void MapHospitalGroupEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("api/hospital-groups")
                .WithTags("Hospital Groups")
                .WithOpenApi();

            // Create hospital group
            group.MapPost("/create", async (
                CreateHospitalGroupViewModel newHospitalGroup,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                CancellationToken cancellationToken
            ) =>
            {
                var notifications = (DomainNotificationHandler)handler;

                await bus.SendCommandAsync(new CreateHospitalGroupCommand(newHospitalGroup));

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

                return Results.Created($"/api/hospital-groups/{newHospitalGroup.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newHospitalGroup.Id
                });
            }).WithName("CreateHospitalGroup")
            .WithSummary("Create new hospital group")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest);
        }
    }
}
