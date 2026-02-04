using PhysioBoo.Application.Commands.Profiles.CreateProfile;
using PhysioBoo.Application.ViewModels.Profiles;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class ProfileEndpoints
    {
        public static void MapProfileEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/profiles")
                .WithTags("Profiles")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create profile
            group.MapPost("/create", async (
                CreateProfileViewModel newProfile,
                IMediatorHandler bus,
                IUser user,
                CancellationToken cancellationToken
            ) =>
            {
                Guid id = user.GetUserId();

                await bus.SendCommandAsync(new CreateProfileCommand(newProfile, id));

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
