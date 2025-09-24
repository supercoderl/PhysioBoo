using MediatR;
using PhysioBoo.Application.Commands.Profiles.CreateProfile;
using PhysioBoo.Application.ViewModels.Profiles;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Domain.Notifications;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class ProfileEndpoints
    {
        public static void MapProfileEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("api/profiles")
                .WithTags("Profiles")
                .WithOpenApi();

            // Create profile
            group.MapPost("/create", async (
                CreateProfileViewModel newProfile,
                IMediatorHandler bus,
                INotificationHandler<DomainNotification> handler,
                IUser user,
                CancellationToken cancellationToken
            ) =>
            {
                var notifications = (DomainNotificationHandler)handler;

                var id = user.GetUserId();

                await bus.SendCommandAsync(new CreateProfileCommand(newProfile, id));

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

                return Results.Created($"/api/profiles/create/{id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = id
                });
            }).WithName("CreateProfile")
            .WithSummary("Create new profile")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
        }
    }
}
