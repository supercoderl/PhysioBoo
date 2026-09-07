using FluentValidation.Results;

using PhysioBoo.Application.ViewModels.Articles;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Articles.CreateArticle
{
    public sealed class CreateArticleCommand : CommandBase, IRequest
    {
        private static readonly CreateArticleCommandValidation s_validation = new();

        public CreateArticleViewModel NewArticle { get; }
        public Guid NewId { get; }

        public CreateArticleCommand(CreateArticleViewModel newArticle, Guid newId) : base(Guid.NewGuid())
        {
            NewArticle = newArticle;
            NewId = newId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
