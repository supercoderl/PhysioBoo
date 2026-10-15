
using Microsoft.AspNetCore.Authorization;
using PhysioBoo.Application.Commands.Articles.CreateArticle;
using PhysioBoo.Application.Commands.Articles.DeleteArticle;
using PhysioBoo.Application.Commands.Articles.UpdateArticle;
using PhysioBoo.Application.Queries.Articles.GetAll;
using PhysioBoo.Application.Queries.Articles.GetById;
using PhysioBoo.Application.ViewModels.Articles;
using PhysioBoo.Domain.Enums;
using System.Security.Claims;






namespace PhysioBoo.Presentation.Endpoints
{
    public static class ArticleEndpoints
    {
        public static void MapArticleEndpoints(this IEndpointRouteBuilder app)
        {
            RouteGroupBuilder group = app.MapGroup("api/articles")
                .WithTags("Articles")
                .WithOpenApi()
                .AddEndpointFilter<NotificationResultFilter>();

            #region Create New Article
            group.MapPost("", async (
                [FromBody] CreateArticleViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                Guid newId = Guid.NewGuid();
                await bus.SendCommandAsync(new CreateArticleCommand(request, newId));

                return Results.CreatedAtRoute(
                    "GetArticleById",
                    new { id = newId },
                    new ResponseMessage<Guid>
                    {
                        Success = true,
                        Data = newId
                    }
                );
            }).WithName("CreateArticle")
            .WithSummary("Create new article")
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status201Created)
            .Produces<ResponseMessage<Guid>>(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Cms.ArticleCreate);
            #endregion

            #region Search Articles
            group.MapPost("search", async (
                [FromBody] PagedRequest<ArticleFilter> request,
                ClaimsPrincipal user,
                IAuthorizationService authorization,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                // The route is public, so only staff may ask for non-Published articles.
                if (request.Filter is not null && !await CanReadUnpublishedAsync(user, authorization))
                {
                    request.Filter = request.Filter with
                    {
                        Status = request.Filter.Status is null ? null : ArticleStatus.Published,
                        IncludeUnpublished = false
                    };
                }

                PagedResult<ArticleViewModel> result = await bus.QueryAsync(new GetAllArticlesQuery(request));

                return Results.Ok(new ResponseMessage<PagedResult<ArticleViewModel>>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetArticles")
            .WithSummary("Retrieve a paginated list of articles with filters and sorting. Publicly accessible; only Published articles are returned unless an explicit status filter is provided.")
            .Produces<ResponseMessage<PagedResult<ArticleViewModel>>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<PagedResult<ArticleViewModel>>>(StatusCodes.Status400BadRequest);
            #endregion

            #region Delete Article
            group.MapDelete("{id:guid}", async (
                Guid id,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new DeleteArticleCommand(id));

                return Results.NoContent();
            }).WithName("DeleteArticle")
            .WithSummary("Handles requests to delete a specific article by its identifier.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .RequireAuthorization(Permissions.Cms.ArticleDelete);
            #endregion

            #region Update Article
            group.MapPatch("{id:guid}", async (
                Guid id,
                [FromBody] UpdateArticleViewModel request,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                await bus.SendCommandAsync(new UpdateArticleCommand(request, id));

                return Results.NoContent();
            }).WithName("UpdateArticle")
            .WithSummary("Update article")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .RequireAuthorization(Permissions.Cms.ArticleUpdate);
            #endregion

            #region Get Article By Id
            group.MapGet("{id:guid}", async (
                Guid id,
                ClaimsPrincipal user,
                IAuthorizationService authorization,
                IMediatorHandler bus,
                CancellationToken ct
            ) =>
            {
                ArticleViewModel? result = await bus.QueryAsync(new GetArticleByIdQuery(id));

                // Draft and archived articles must not leak through the public route.
                if (result is not null && result.Status != ArticleStatus.Published && !await CanReadUnpublishedAsync(user, authorization))
                {
                    result = null;
                }

                return Results.Ok(new ResponseMessage<ArticleViewModel?>
                {
                    Success = true,
                    Data = result
                });
            }).WithName("GetArticleById")
            .WithSummary("Retrieve an article record. Publicly accessible.")
            .Produces<ResponseMessage<ArticleViewModel?>>(StatusCodes.Status200OK)
            .Produces<ResponseMessage<ArticleViewModel?>>(StatusCodes.Status400BadRequest);
            #endregion
        }

        private static async Task<bool> CanReadUnpublishedAsync(ClaimsPrincipal user, IAuthorizationService authorization)
        {
            AuthorizationResult result = await authorization.AuthorizeAsync(user, Permissions.Cms.ArticleRead);
            return result.Succeeded;
        }
    }
}
