using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Articles
{
    public sealed record UpdateArticleViewModel
    (
        string Title,
        string Slug,
        string Author,
        ArticleCategory Category,
        string? Tags,
        string? CoverImageUrl,
        string Excerpt,
        string Content,
        ArticleStatus Status,
        DateTime? PublishDate,
        string? ReadTime
    );
}
