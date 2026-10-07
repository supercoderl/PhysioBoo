using PhysioBoo.Application.Queries.AudienceSegments.GetLookup;
using PhysioBoo.Application.ViewModels.AudienceSegments;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class AudienceSegmentEndpoints
    {
        public static void MapAudienceSegmentEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/audience-segments")
                .WithTags("Audience Segments")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Lookup
            group.MapGet("/lookup", async (
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                List<AudienceSegmentViewModel> result = await bus.QueryAsync(new GetAudienceSegmentsQuery());

                return Results.Ok(new ResponseMessage<List<AudienceSegmentViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("LookupAudienceSegments")
            .WithSummary("List the built-in audience segments with their live member counts.")
            .Produces<ResponseMessage<List<AudienceSegmentViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Crm.CampaignRead);
            #endregion
        }
    }
}
