using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Articles.DeleteArticle
{
    public sealed class DeleteArticleCommand : CommandBase
    {
        private static readonly DeleteArticleCommandValidation s_validation = new();

        public Guid Id { get; }
        public bool IsHard { get; }

        public DeleteArticleCommand(
            Guid id,
            bool isHard = false
        ) : base(Guid.NewGuid())
        {
            Id = id;
            IsHard = isHard;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
