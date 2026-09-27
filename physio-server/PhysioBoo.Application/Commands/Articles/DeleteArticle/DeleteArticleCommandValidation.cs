using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Articles.DeleteArticle
{
    public sealed class DeleteArticleCommandValidation : AbstractValidator<DeleteArticleCommand>
    {
        public DeleteArticleCommandValidation()
        {
            RuleForId();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Article.EmptyId)
                .WithMessage("Id may not be empty.");
        }
    }
}
