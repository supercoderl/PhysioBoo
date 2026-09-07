
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Articles.CreateArticle
{
    public sealed class CreateArticleCommandValidation : AbstractValidator<CreateArticleCommand>
    {
        public CreateArticleCommandValidation()
        {
            RuleForTitle();
            RuleForSlug();
            RuleForAuthor();
            RuleForExcerpt();
            RuleForContent();
        }

        public void RuleForTitle()
        {
            RuleFor(cmd => cmd.NewArticle.Title)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Article.EmptyTitle)
                .WithMessage("Title may not be empty.")
                .MaximumLength(200)
                .WithErrorCode(DomainErrorCodes.Article.TitleExceedsMaxLength)
                .WithMessage("Title may not exceed 200 characters.");
        }

        public void RuleForSlug()
        {
            RuleFor(cmd => cmd.NewArticle.Slug)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Article.EmptySlug)
                .WithMessage("Slug may not be empty.");
        }

        public void RuleForAuthor()
        {
            RuleFor(cmd => cmd.NewArticle.Author)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Article.EmptyAuthor)
                .WithMessage("Author may not be empty.");
        }

        public void RuleForExcerpt()
        {
            RuleFor(cmd => cmd.NewArticle.Excerpt)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Article.EmptyExcerpt)
                .WithMessage("Excerpt may not be empty.")
                .MaximumLength(300)
                .WithErrorCode(DomainErrorCodes.Article.ExcerptExceedsMaxLength)
                .WithMessage("Excerpt may not exceed 300 characters.");
        }

        public void RuleForContent()
        {
            RuleFor(cmd => cmd.NewArticle.Content)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Article.EmptyContent)
                .WithMessage("Content may not be empty.");
        }
    }
}
