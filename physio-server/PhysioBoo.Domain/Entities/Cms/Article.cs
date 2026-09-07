using NpgsqlTypes;

namespace PhysioBoo.Domain.Entities.Cms
{
    public class Article : Entity
    {
        #region Core Article Table (13)
        public string Title { get; private set; }
        public string Slug { get; private set; }
        public ArticleCategory Category { get; private set; }
        public string? Tags { get; private set; }
        public string? CoverImageUrl { get; private set; }
        public string Excerpt { get; private set; }
        public string Content { get; private set; }
        public string Author { get; private set; }
        public ArticleStatus Status { get; private set; }
        public DateTime? PublishDate { get; private set; }
        public string? ReadTime { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? UpdatedAt { get; private set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public NpgsqlTsVector? SearchVector { get; private set; }
        #endregion

        #region Constructor (13)
        public Article(
            Guid id,
            string title,
            string slug,
            ArticleCategory category,
            string? tags,
            string? coverImageUrl,
            string excerpt,
            string content,
            string author,
            ArticleStatus status,
            DateTime? publishDate,
            string? readTime
        ) : base(id)
        {
            Title = title;
            Slug = slug;
            Category = category;
            Tags = tags;
            CoverImageUrl = coverImageUrl;
            Excerpt = excerpt;
            Content = content;
            Author = author;
            Status = status;
            PublishDate = publishDate;
            ReadTime = readTime;
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
            UpdatedAt = null;
        }
        #endregion

        #region Setter Methods (13)
        public void SetTitle(string title) { Title = title; }
        public void SetSlug(string slug) { Slug = slug; }
        public void SetCategory(ArticleCategory category) { Category = category; }
        public void SetTags(string? tags) { Tags = tags; }
        public void SetCoverImageUrl(string? coverImageUrl) { CoverImageUrl = coverImageUrl; }
        public void SetExcerpt(string excerpt) { Excerpt = excerpt; }
        public void SetContent(string content) { Content = content; }
        public void SetAuthor(string author) { Author = author; }
        public void SetStatus(ArticleStatus status) { Status = status; }
        public void SetPublishDate(DateTime? publishDate) { PublishDate = publishDate; }
        public void SetReadTime(string? readTime) { ReadTime = readTime; }
        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        public void SetUpdatedAt(DateTime? updatedAt) { UpdatedAt = updatedAt; }
        #endregion
    }
}
