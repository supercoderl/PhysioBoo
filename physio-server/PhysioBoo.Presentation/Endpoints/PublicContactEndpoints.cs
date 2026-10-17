using PhysioBoo.Application.Commands.Public.SendContactMessage;
using PhysioBoo.Application.ViewModels.Public;

namespace PhysioBoo.Presentation.Endpoints
{
    // Anonymous contact form of the public website. Scoped to the `PublicSite:TenantId` tenant like the doctor
    // endpoints, 503 until that is configured, and rate-limited like appointment requests.
    public static class PublicContactEndpoints
    {
        public static void MapPublicContactEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/public/contact-messages")
                .WithTags("Public website")
                .WithOpenApi()
                .AllowAnonymous()
                .AddEndpointFilter<NotificationResultFilter>();

            group.MapPost("", async (
                [FromBody] PublicContactMessageViewModel request,
                IConfiguration configuration,
                IMediatorHandler bus
            ) =>
            {
                if (!PublicDoctorEndpoints.TryGetSiteTenant(configuration, out Guid tenantId)) return PublicDoctorEndpoints.SiteNotConfigured();

                Guid newId = Guid.NewGuid();
                await bus.SendCommandAsync(new SendPublicContactMessageCommand(newId, tenantId, request));

                // Validation failures are turned into 400 by NotificationResultFilter.
                return Results.Ok(new ResponseMessage<PublicContactMessageResultViewModel>
                {
                    Success = true,
                    Data = new PublicContactMessageResultViewModel("MSG-" + newId.ToString("N")[..8].ToUpperInvariant())
                });
            }).WithName("SendPublicContactMessage")
            .WithSummary("A visitor sends a message to the team from the contact page. Stored as a CRM lead.")
            .Produces<ResponseMessage<PublicContactMessageResultViewModel>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status429TooManyRequests)
            .Produces(StatusCodes.Status503ServiceUnavailable)
            .RequireRateLimiting(PublicDoctorEndpoints.PublicFormsPolicy);
        }
    }
}
