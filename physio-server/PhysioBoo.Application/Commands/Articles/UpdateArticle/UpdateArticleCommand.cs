using PhysioBoo.Application.ViewModels.Articles;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Articles.UpdateArticle
{
    public sealed class UpdateArticleCommand : CommandBase
    {
        private static readonly UpdateArticleCommandValidation s_validation = new();

        public UpdateArticleViewModel Article { get; }
        public Guid Id { get; }

        public UpdateArticleCommand(UpdateArticleViewModel article, Guid id) : base(Guid.NewGuid())
        {
            Article = article;
            Id = id;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
