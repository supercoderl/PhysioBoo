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
                CancellationToken cancellationToken
            ) =>
            {
                await bus.SendCommandAsync(new CreateProfileCommand(newProfile));

                return Results.Created($"/api/profiles/create", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = "Profile has been created successfully."
                });
            }).WithName("CreateProfile")
            .WithSummary("Create new profile")
            .Produces<ResponseMessage<string>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<string>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
        }
    }
}
