using PhysioBoo.Application.Queries.Locations.GetOptions;
using PhysioBoo.Application.ViewModels.Locations;

namespace PhysioBoo.Presentation.Endpoints
{
    /// <summary>
    /// Cascading Country → City → District → Ward lookups for the address picker.
    /// Public, read-only reference data (the tenant sign-up form needs it before login), cached by the browser for a day.
    /// </summary>
    public static class LocationEndpoints
    {
        private const string CacheControlValue = "public, max-age=86400";

        public static void MapLocationEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/locations")
                .WithTags("Locations")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>()
                .AllowAnonymous();

            #region Countries
            group.MapGet("/countries", (IMediatorHandler bus, HttpContext http) =>
                    GetOptionsAsync(bus, http, LocationLevel.Country, null))
                .WithName("GetLocationCountries")
                .WithSummary("Active countries, sorted by name.")
                .Produces<ResponseMessage<List<LocationOptionViewModel>>>(StatusCodes.Status200OK);
            #endregion

            #region Cities
            group.MapGet("/countries/{countryId:guid}/cities", (Guid countryId, IMediatorHandler bus, HttpContext http) =>
                    GetOptionsAsync(bus, http, LocationLevel.City, countryId))
                .WithName("GetLocationCities")
                .WithSummary("Active cities (first administrative level) of a country. Empty when the country has none.")
                .Produces<ResponseMessage<List<LocationOptionViewModel>>>(StatusCodes.Status200OK);
            #endregion

            #region Districts
            group.MapGet("/cities/{cityId:guid}/districts", (Guid cityId, IMediatorHandler bus, HttpContext http) =>
                    GetOptionsAsync(bus, http, LocationLevel.District, cityId))
                .WithName("GetLocationDistricts")
                .WithSummary("Active districts of a city. Empty when the city has none.")
                .Produces<ResponseMessage<List<LocationOptionViewModel>>>(StatusCodes.Status200OK);
            #endregion

            #region Wards
            group.MapGet("/districts/{districtId:guid}/wards", (Guid districtId, IMediatorHandler bus, HttpContext http) =>
                    GetOptionsAsync(bus, http, LocationLevel.Ward, districtId))
                .WithName("GetLocationWards")
                .WithSummary("Active wards of a district. Empty when the district has none.")
                .Produces<ResponseMessage<List<LocationOptionViewModel>>>(StatusCodes.Status200OK);
            #endregion
        }

        private static async Task<IResult> GetOptionsAsync(IMediatorHandler bus, HttpContext http, LocationLevel level, Guid? parentId)
        {
            List<LocationOptionViewModel> result = await bus.QueryAsync(new GetLocationOptionsQuery(level, parentId));

            http.Response.Headers.CacheControl = CacheControlValue;

            return Results.Ok(new ResponseMessage<List<LocationOptionViewModel>>
            {
                Success = true,
                Data = result
            });
        }
    }
}
