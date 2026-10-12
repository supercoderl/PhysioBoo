using PhysioBoo.Domain.Interfaces.Seeding;

namespace PhysioBoo.Presentation.Endpoints
{
    /// <summary>
    /// Super Admin dev tool: fill a tenant with fake module data. Everything is rejected outside Development.
    /// A refusal is a 400 with a message, never 403/404, because the web app redirects those to its error pages.
    /// </summary>
    public static class DevDataEndpoints
    {
        public sealed record GenerateDevDataRequest(Guid TenantId, int Count);

        public static void MapDevDataEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/superadmin/dev-data")
                .WithTags("Dev data")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            group.MapGet("/modules", (IDevDataService devData) => Ok(devData.GetModules()))
            .WithName("GetDevDataModules")
            .Produces<ResponseMessage<DevDataModuleList>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.System.DevAccess);

            group.MapPost("/{moduleKey}/generate", async (
                string moduleKey,
                [FromBody] GenerateDevDataRequest body,
                IDevDataService devData,
                CancellationToken ct
            ) =>
            {
                try
                {
                    return Ok(await devData.GenerateAsync(moduleKey, body.TenantId, body.Count, ct));
                }
                catch (DevDataException ex)
                {
                    return Results.BadRequest(new ResponseMessage<DevDataResult>
                    {
                        Success = false,
                        Errors = new[] { ex.Message }
                    });
                }
            })
            .WithName("GenerateDevData")
            .Produces<ResponseMessage<DevDataResult>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<DevDataResult>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.System.DevAccess);
        }

        private static IResult Ok<T>(T data)
        {
            return Results.Ok(new ResponseMessage<T>
            {
                Success = true,
                Data = data
            });
        }
    }
}
