using PhysioBoo.Domain.Entities.Cms;
using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.ViewModels.Articles
{
    public sealed class ArticleViewModel
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public ArticleCategory Category { get; set; }
        public string? Tags { get; set; }
        public string? CoverImageUrl { get; set; }
        public string Excerpt { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public ArticleStatus Status { get; set; }
        public DateTime? PublishDate { get; set; }
        public string? ReadTime { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public static ArticleViewModel FromArticle(Article article)
        {
            return new ArticleViewModel
            {
                Id = article.Id,
                Title = article.Title,
                Slug = article.Slug,
                Category = article.Category,
                Tags = article.Tags,
                CoverImageUrl = article.CoverImageUrl,
                Excerpt = article.Excerpt,
                Content = article.Content,
                Author = article.Author,
                Status = article.Status,
                PublishDate = article.PublishDate,
                ReadTime = article.ReadTime,
                CreatedAt = article.CreatedAt,
                UpdatedAt = article.UpdatedAt
            };
        }
    }
}
