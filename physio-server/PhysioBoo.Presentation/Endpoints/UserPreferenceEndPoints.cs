using Microsoft.AspNetCore.Mvc;
using PhysioBoo.Application.Commands.UserPreferences.UpsertUserPreference;
using PhysioBoo.Application.ViewModels.UserPreferences;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class UserPreferenceEndpoints
    {
        public static void MapUserPreferenceEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/user-preferences")
                .WithTags("User Preferences")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Insert Key - Value
            group.MapPost("", async (
                [FromBody] UpsertUserPreferenceViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new UpsertUserPreferenceCommand(request));

                return Results.NoContent();
            }).WithName("InsertKey")
            .WithSummary("Insert user preference")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
            #endregion
        }
    }
}
