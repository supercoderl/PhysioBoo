using PhysioBoo.Application.Commands.Reviews;
using PhysioBoo.Application.ViewModels.Reviews;
using PhysioBoo.Domain.Constants;
using PhysioBoo.Domain.Interfaces;
using PhysioBoo.Presentation.Filters;
using PhysioBoo.Presentation.Models;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class ReviewEndpoints
    {
        public static void MapReviewEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/reviews")
                .WithTags("Reviews")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            // Create review
            group.MapPost("/create", async (
                CreateReviewViewModel newReview,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new CreateReviewCommand(newReview));

                return Results.Created($"/api/reviews/{newReview.Id}", new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newReview.Id
                });
            }).WithName("CreateReview")
            .WithSummary("Create new review")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Portal.ReviewCreate);
        }
    }
}
