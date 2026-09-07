
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Articles.UpdateArticle
{
    public sealed class UpdateArticleCommandValidation : AbstractValidator<UpdateArticleCommand>
    {
        public UpdateArticleCommandValidation()
        {
            RuleFor(cmd => cmd.Article.Title)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Article.EmptyTitle)
                .WithMessage("Title may not be empty.")
                .MaximumLength(200)
                .WithErrorCode(DomainErrorCodes.Article.TitleExceedsMaxLength)
                .WithMessage("Title may not exceed 200 characters.");

            RuleFor(cmd => cmd.Article.Slug)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Article.EmptySlug)
                .WithMessage("Slug may not be empty.");

            RuleFor(cmd => cmd.Article.Author)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Article.EmptyAuthor)
                .WithMessage("Author may not be empty.");

            RuleFor(cmd => cmd.Article.Excerpt)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Article.EmptyExcerpt)
                .WithMessage("Excerpt may not be empty.")
                .MaximumLength(300)
                .WithErrorCode(DomainErrorCodes.Article.ExcerptExceedsMaxLength)
                .WithMessage("Excerpt may not exceed 300 characters.");

            RuleFor(cmd => cmd.Article.Content)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Article.EmptyContent)
                .WithMessage("Content may not be empty.");
        }
    }
}
