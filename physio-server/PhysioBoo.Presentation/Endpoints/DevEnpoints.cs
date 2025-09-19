using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class DevEndpoints
    {
        public static void MapDevEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("api/devs")
                .WithTags("Cookies")
                .WithOpenApi();

            // Get cookies
            group.MapPost("/cookies", (
                HttpRequest request,
                CancellationToken cancellationToken
            ) =>
            {
                var cookies = request.Cookies;
                return Results.Ok(new ResponseMessage<IRequestCookieCollection>
                {
                    Success = true,
                    Data = cookies
                });
            }).WithName("GetCookies")
            .WithSummary("Get all cookies from request")
            .Produces<ResponseMessage<IRequestCookieCollection>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<IRequestCookieCollection>>(StatusCodes.Status400BadRequest);

            // Check is authenticated
            group.MapPost("/is-authenticated", (
                HttpContext context,
                CancellationToken cancellationToken
            ) =>
            {
                var isAuthenticated = context.User.Identity?.IsAuthenticated;

                return Results.Ok(new ResponseMessage<string>
                {
                    Success = true,
                    Data = $"Status: {isAuthenticated}"
                });
            }).WithName("Check Is Authenticated")
            .WithSummary("Check user is authenticated or not")
            .Produces<ResponseMessage<string>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<string>>(StatusCodes.Status400BadRequest);
        }
    }
}
