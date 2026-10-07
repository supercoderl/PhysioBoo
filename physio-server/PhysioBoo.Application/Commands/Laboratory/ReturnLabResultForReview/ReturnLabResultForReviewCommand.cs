using PhysioBoo.Application.ViewModels.Laboratory;

namespace PhysioBoo.Application.Commands.Laboratory.ReturnLabResultForReview
{
    public sealed class ReturnLabResultForReviewCommand : CommandBase, IRequest
    {
        private static readonly ReturnLabResultForReviewCommandValidation s_validation = new();

        public Guid Id { get; }
        public LabReasonViewModel Body { get; }

        public ReturnLabResultForReviewCommand(Guid id, LabReasonViewModel body) : base(Guid.NewGuid())
        {
            Id = id;
            Body = body;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
