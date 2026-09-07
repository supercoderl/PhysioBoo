using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Articles
{
    /// <summary>
    /// Represents filter criteria when querying articles.
    /// </summary>
    public sealed record ArticleFilter
    (
        string Start,
        string End,
        ArticleCategory? Category,
        ArticleStatus? Status
    );
}
