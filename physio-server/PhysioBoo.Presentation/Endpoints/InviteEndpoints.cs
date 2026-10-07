using PhysioBoo.Application.Commands.Invites.RevokeInvite;
using PhysioBoo.Application.Queries.Invites.GetPending;

using PhysioBoo.Application.Commands.Invites.CreateInvite;
using PhysioBoo.Application.ViewModels.Invites;
using PhysioBoo.Domain.Constants;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class InviteEndpoints
    {
        public static void MapInviteEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/invites")
                .WithTags("Invites")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Create Invite
            group.MapPost("", async (
                [FromBody] CreateInviteViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                Guid newId = Guid.NewGuid();

                await bus.SendCommandAsync(new CreateInviteCommand(newId, request));

                // No "GetInviteById" named route exists yet, so CreatedAtRoute would throw
                // when generating the Location header — Created(uri, ...) needs no named route,
                // same reasoning as UserEndpoints' /register.
                return Results.Created(
                    $"/api/invites/{newId}",
                    new ResponseMessage<Guid>
                    {
                        Success = true,
                        Data = newId
                    }
                );
            }).WithName("CreateInvite")
            .WithSummary("Invite a new user (staff, doctor, patient, etc.) into the current tenant")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Admin.InviteCreate);
            #endregion

            #region Pending Invites
            group.MapGet("", async (IMediatorHandler bus) =>
            {
                List<TenantInviteViewModel> result = await bus.QueryAsync(new GetPendingInvitesQuery());
                return Results.Ok(new ResponseMessage<List<TenantInviteViewModel>> { Success = true, Data = result });
            }).WithName("GetPendingInvites")
            .WithSummary("Unused, unexpired invites of the current tenant.")
            .Produces<ResponseMessage<List<TenantInviteViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Admin.InviteRead);
            #endregion

            #region Revoke Invite
            group.MapDelete("{id:guid}", async (Guid id, IMediatorHandler bus) =>
            {
                await bus.SendCommandAsync(new RevokeInviteCommand(id));
                return Results.Ok(new ResponseMessage<Guid> { Success = true, Data = id });
            }).WithName("RevokeInvite")
            .WithSummary("Revoke an unused invite.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Admin.InviteRevoke);
            #endregion
        }
    }
}
