using PhysioBoo.Application.Commands.HomeTestimonials.CreateHomeTestimonial;
using PhysioBoo.Application.Commands.HomeTestimonials.DeleteHomeTestimonial;
using PhysioBoo.Application.Commands.HomeTestimonials.UpdateHomeTestimonial;
using PhysioBoo.Application.Queries.HomeTestimonials.GetAll;
using PhysioBoo.Application.Queries.HomeTestimonials.GetById;
using PhysioBoo.Application.ViewModels.HomeContent;

namespace PhysioBoo.Presentation.Endpoints
{
    public static class HomeTestimonialEndpoints
    {
        public static void MapHomeTestimonialEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/home-testimonials")
                .WithTags("Home Testimonials")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Search
            group.MapPost("/search", async (
                [FromBody] PagedRequest<HomeTestimonialFilter> request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                PagedResult<HomeTestimonialViewModel> result = await bus.QueryAsync(new GetAllHomeTestimonialsQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<HomeTestimonialViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("SearchHomeTestimonials")
            .WithSummary("Retrieve a paginated list of home page testimonials.")
            .Produces<ResponseMessage<PagedResult<HomeTestimonialViewModel>>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Cms.HomeSettingsRead);
            #endregion

            #region Create
            group.MapPost("", async (
                [FromBody] SaveHomeTestimonialViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                Guid newId = Guid.NewGuid();

                await bus.SendCommandAsync(new CreateHomeTestimonialCommand(newId, request));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = newId
                });
            }).WithName("CreateHomeTestimonial")
            .WithSummary("Create a home page testimonial.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Cms.HomeSettingsUpdate);
            #endregion

            #region Get By Id
            group.MapGet("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                HomeTestimonialViewModel? result = await bus.QueryAsync(new GetHomeTestimonialByIdQuery(id));

                return Results.Ok(new ResponseMessage<HomeTestimonialViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetHomeTestimonialById")
            .WithSummary("Retrieve a single home page testimonial.")
            .Produces<ResponseMessage<HomeTestimonialViewModel?>>(StatusCodes.Status200OK)
            .RequireAuthorization(Permissions.Cms.HomeSettingsRead);
            #endregion

            #region Update
            group.MapPatch("{id:guid}", async (
                Guid id,
                [FromBody] SaveHomeTestimonialViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new UpdateHomeTestimonialCommand(id, request));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = id
                });
            }).WithName("UpdateHomeTestimonial")
            .WithSummary("Update a home page testimonial.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Cms.HomeSettingsUpdate);
            #endregion

            #region Delete
            group.MapDelete("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new DeleteHomeTestimonialCommand(id));

                return Results.Ok(new ResponseMessage<Guid>
                {
                    Success = true,
                    Data = id
                });
            }).WithName("DeleteHomeTestimonial")
            .WithSummary("Delete a home page testimonial.")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Cms.HomeSettingsUpdate);
            #endregion
        }
    }
}
