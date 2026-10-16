using PhysioBoo.Application.Queries.Public.Hospitals;
using PhysioBoo.Application.ViewModels.Public;

namespace PhysioBoo.Presentation.Endpoints
{
    // Anonymous endpoints for the public website's clinic listing. Scoped to the `PublicSite:TenantId` tenant
    // like the doctor endpoints, and 503 until that is configured.
    public static class PublicHospitalEndpoints
    {
        public static void MapPublicHospitalEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/public/hospitals")
                .WithTags("Public website")
                .WithOpenApi()
                .AllowAnonymous()
                .AddEndpointFilter<NotificationResultFilter>();

            group.MapPost("/search", async (
                [FromBody] PagedRequest<PublicHospitalFilter> request,
                IConfiguration configuration,
                IMediatorHandler bus
            ) =>
            {
                if (!PublicDoctorEndpoints.TryGetSiteTenant(configuration, out Guid tenantId)) return PublicDoctorEndpoints.SiteNotConfigured();

                PagedResult<PublicHospitalViewModel> result = await bus.QueryAsync(new SearchPublicHospitalsQuery(tenantId, request));

                return Results.Ok(new ResponseMessage<PagedResult<PublicHospitalViewModel>> { Success = true, Data = result });
            }).WithName("SearchPublicHospitals")
            .WithSummary("Active clinics of the site's tenant, searchable by name or address and filterable by facility type.")
            .Produces<ResponseMessage<PagedResult<PublicHospitalViewModel>>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status503ServiceUnavailable);

            group.MapGet("{id:guid}", async (Guid id, IConfiguration configuration, IMediatorHandler bus) =>
            {
                if (!PublicDoctorEndpoints.TryGetSiteTenant(configuration, out Guid tenantId)) return PublicDoctorEndpoints.SiteNotConfigured();

                PublicHospitalDetailViewModel? result = await bus.QueryAsync(new GetPublicHospitalQuery(tenantId, id));

                // Unknown, inactive, deleted and other-tenant clinics all answer the same 404, so nothing hidden is revealed.
                return result is null
                    ? Results.Json(new ResponseMessage<object> { Success = false, Errors = new[] { "Clinic not found." } }, statusCode: StatusCodes.Status404NotFound)
                    : Results.Ok(new ResponseMessage<PublicHospitalDetailViewModel> { Success = true, Data = result });
            }).WithName("GetPublicHospital")
            .WithSummary("Public profile of one active clinic: contact details, languages and published services.")
            .Produces<ResponseMessage<PublicHospitalDetailViewModel>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status503ServiceUnavailable);
        }
    }
}
