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
        ArticleStatus? Status,
        // Staff only: without a Status, also return Draft and Archived articles (ignored for anonymous callers).
        bool IncludeUnpublished = false
    );
}
