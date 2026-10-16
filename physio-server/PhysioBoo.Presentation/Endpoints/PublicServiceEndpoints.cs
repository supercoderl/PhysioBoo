using PhysioBoo.Application.Queries.Public.Services;
using PhysioBoo.Application.ViewModels.Public;

namespace PhysioBoo.Presentation.Endpoints
{
    // Anonymous endpoints for the public website's service listing. Scoped to the `PublicSite:TenantId` tenant
    // like the doctor endpoints, and 503 until that is configured.
    public static class PublicServiceEndpoints
    {
        public static void MapPublicServiceEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/public/services")
                .WithTags("Public website")
                .WithOpenApi()
                .AllowAnonymous()
                .AddEndpointFilter<NotificationResultFilter>();

            group.MapPost("/search", async (
                [FromBody] PagedRequest<PublicServiceFilter> request,
                IConfiguration configuration,
                IMediatorHandler bus
            ) =>
            {
                if (!PublicDoctorEndpoints.TryGetSiteTenant(configuration, out Guid tenantId)) return PublicDoctorEndpoints.SiteNotConfigured();

                PagedResult<PublicServiceViewModel> result = await bus.QueryAsync(new SearchPublicServicesQuery(tenantId, request));

                return Results.Ok(new ResponseMessage<PagedResult<PublicServiceViewModel>> { Success = true, Data = result });
            }).WithName("SearchPublicServices")
            .WithSummary("Published services of the site's tenant, searchable by name or description and filterable by clinic.")
            .Produces<ResponseMessage<PagedResult<PublicServiceViewModel>>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status503ServiceUnavailable);

            group.MapGet("/filters", async (IConfiguration configuration, IMediatorHandler bus) =>
            {
                if (!PublicDoctorEndpoints.TryGetSiteTenant(configuration, out Guid tenantId)) return PublicDoctorEndpoints.SiteNotConfigured();

                PublicServiceFilterOptionsViewModel result = await bus.QueryAsync(new GetPublicServiceFilterOptionsQuery(tenantId));

                return Results.Ok(new ResponseMessage<PublicServiceFilterOptionsViewModel> { Success = true, Data = result });
            }).WithName("GetPublicServiceFilterOptions")
            .WithSummary("Clinics that have at least one published service.")
            .Produces<ResponseMessage<PublicServiceFilterOptionsViewModel>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status503ServiceUnavailable);

            group.MapGet("{id:guid}", async (Guid id, IConfiguration configuration, IMediatorHandler bus) =>
            {
                if (!PublicDoctorEndpoints.TryGetSiteTenant(configuration, out Guid tenantId)) return PublicDoctorEndpoints.SiteNotConfigured();

                PublicServiceDetailViewModel? result = await bus.QueryAsync(new GetPublicServiceQuery(tenantId, id));

                // Unknown, unpublished, archived, deleted and other-tenant services all answer the same 404.
                return result is null
                    ? Results.Json(new ResponseMessage<object> { Success = false, Errors = new[] { "Service not found." } }, statusCode: StatusCodes.Status404NotFound)
                    : Results.Ok(new ResponseMessage<PublicServiceDetailViewModel> { Success = true, Data = result });
            }).WithName("GetPublicService")
            .WithSummary("Public profile of one published service: description, its clinic and the doctors who deliver it.")
            .Produces<ResponseMessage<PublicServiceDetailViewModel>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status503ServiceUnavailable);
        }
    }
}
