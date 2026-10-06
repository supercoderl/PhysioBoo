using PhysioBoo.Application.Commands.Tenants.RegisterTenant;
using PhysioBoo.Application.ViewModels.Tenants;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class TenantEndpoints
    {
        public static void MapTenantEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/tenants")
                .WithTags("Tenants")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Register Tenant
            group.MapPost("/register", async (
                [FromBody] RegisterTenantViewModel newTenant,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                Guid newId = Guid.NewGuid();

                await bus.SendCommandAsync(new RegisterTenantCommand(newId, newTenant));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newId
                });
            }).WithName("RegisterTenant")
            .WithSummary("Self-service sign-up: creates the hospital group, its branches, the owner (ADMIN) account and a trial subscription.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .AllowAnonymous();
            #endregion
        }
    }
}
