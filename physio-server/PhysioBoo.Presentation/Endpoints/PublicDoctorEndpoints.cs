using PhysioBoo.Application.Commands.Public.RequestAppointment;
using PhysioBoo.Application.Queries.Public.Doctors;
using PhysioBoo.Application.ViewModels.Public;

namespace PhysioBoo.Presentation.Endpoints
{
    // Anonymous endpoints for the public website's doctor listing.
    // The site shows one tenant, set by `PublicSite:TenantId`; until it is configured these return 503
    // rather than falling back to every tenant's doctors.
    public static class PublicDoctorEndpoints
    {
        /// <summary>Rate-limit policy for anonymous form posts (see Program.cs).</summary>
        public const string PublicFormsPolicy = "public-forms";

        public static void MapPublicDoctorEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/public/doctors")
                .WithTags("Public website")
                .WithOpenApi()
                .AllowAnonymous()
                .AddEndpointFilter<NotificationResultFilter>();

            group.MapPost("/search", async (
                [FromBody] PagedRequest<PublicDoctorFilter> request,
                IConfiguration configuration,
                IMediatorHandler bus
            ) =>
            {
                if (!TryGetSiteTenant(configuration, out Guid tenantId)) return SiteNotConfigured();

                PagedResult<PublicDoctorViewModel> result = await bus.QueryAsync(new SearchPublicDoctorsQuery(tenantId, request));

                return Results.Ok(new ResponseMessage<PagedResult<PublicDoctorViewModel>> { Success = true, Data = result });
            }).WithName("SearchPublicDoctors")
            .WithSummary("Publicly listed doctors of the site's tenant, with search, specialty, facility and consultation-type filters.")
            .Produces<ResponseMessage<PagedResult<PublicDoctorViewModel>>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status503ServiceUnavailable);

            group.MapGet("/filters", async (IConfiguration configuration, IMediatorHandler bus) =>
            {
                if (!TryGetSiteTenant(configuration, out Guid tenantId)) return SiteNotConfigured();

                PublicDoctorFilterOptionsViewModel result = await bus.QueryAsync(new GetPublicDoctorFilterOptionsQuery(tenantId));

                return Results.Ok(new ResponseMessage<PublicDoctorFilterOptionsViewModel> { Success = true, Data = result });
            }).WithName("GetPublicDoctorFilterOptions")
            .WithSummary("Specialties and facilities that at least one publicly listed doctor has.")
            .Produces<ResponseMessage<PublicDoctorFilterOptionsViewModel>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status503ServiceUnavailable);

            group.MapGet("{id:guid}", async (Guid id, IConfiguration configuration, IMediatorHandler bus) =>
            {
                if (!TryGetSiteTenant(configuration, out Guid tenantId)) return SiteNotConfigured();

                PublicDoctorDetailViewModel? result = await bus.QueryAsync(new GetPublicDoctorQuery(tenantId, id));

                // Unknown, other-tenant and unlisted doctors all answer the same 404, so nothing hidden is revealed.
                return result is null
                    ? Results.Json(new ResponseMessage<object> { Success = false, Errors = new[] { "Doctor not found." } }, statusCode: StatusCodes.Status404NotFound)
                    : Results.Ok(new ResponseMessage<PublicDoctorDetailViewModel> { Success = true, Data = result });
            }).WithName("GetPublicDoctor")
            .WithSummary("Public profile of one listed doctor: overview, services and the facilities they practise at.")
            .Produces<ResponseMessage<PublicDoctorDetailViewModel>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status503ServiceUnavailable);

            group.MapGet("{id:guid}/related", async (Guid id, IConfiguration configuration, IMediatorHandler bus) =>
            {
                if (!TryGetSiteTenant(configuration, out Guid tenantId)) return SiteNotConfigured();

                List<PublicDoctorViewModel> result = await bus.QueryAsync(new GetRelatedPublicDoctorsQuery(tenantId, id));

                return Results.Ok(new ResponseMessage<List<PublicDoctorViewModel>> { Success = true, Data = result });
            }).WithName("GetRelatedPublicDoctors")
            .WithSummary("Up to three other verified doctors sharing a specialty or a facility.")
            .Produces<ResponseMessage<List<PublicDoctorViewModel>>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status503ServiceUnavailable);

            group.MapPost("{id:guid}/appointment-requests", async (
                Guid id,
                [FromBody] PublicAppointmentRequestViewModel request,
                IConfiguration configuration,
                IMediatorHandler bus
            ) =>
            {
                if (!TryGetSiteTenant(configuration, out Guid tenantId)) return SiteNotConfigured();

                Guid newId = Guid.NewGuid();
                await bus.SendCommandAsync(new RequestPublicAppointmentCommand(newId, tenantId, request with { DoctorId = id }));

                // Validation failures are turned into 400/404 by NotificationResultFilter.
                return Results.Ok(new ResponseMessage<PublicAppointmentRequestResultViewModel>
                {
                    Success = true,
                    Data = new PublicAppointmentRequestResultViewModel("REQ-" + newId.ToString("N")[..8].ToUpperInvariant())
                });
            }).WithName("RequestPublicAppointment")
            .WithSummary("A visitor asks the clinic to call back about an appointment. Stored as a CRM lead; not a booking.")
            .Produces<ResponseMessage<PublicAppointmentRequestResultViewModel>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status429TooManyRequests)
            .Produces(StatusCodes.Status503ServiceUnavailable)
            .RequireRateLimiting(PublicFormsPolicy);
        }

        private static bool TryGetSiteTenant(IConfiguration configuration, out Guid tenantId) =>
            Guid.TryParse(configuration["PublicSite:TenantId"], out tenantId) && tenantId != Guid.Empty;

        private static IResult SiteNotConfigured() =>
            Results.Json(new ResponseMessage<object>
            {
                Success = false,
                Errors = new[] { "The public website is not configured yet." }
            }, statusCode: StatusCodes.Status503ServiceUnavailable);
    }
}
