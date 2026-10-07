using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Nursing.UpdateHandover
{
    public sealed class UpdateHandoverCommandValidation : AbstractValidator<UpdateHandoverCommand>
    {
        private const int MaxLength = 2000;

        public UpdateHandoverCommandValidation()
        {
            RuleFor(c => c.CardId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Nursing.EmptyId).WithMessage("Card id may not be empty.");

            foreach (var (field, name) in new (System.Linq.Expressions.Expression<Func<UpdateHandoverCommand, string?>>, string)[]
            {
                (c => c.Sbar.Situation, "Situation"),
                (c => c.Sbar.Background, "Background"),
                (c => c.Sbar.Assessment, "Assessment"),
                (c => c.Sbar.Recommendation, "Recommendation"),
            })
            {
                RuleFor(field)
                    .Must(v => v == null || !string.IsNullOrWhiteSpace(v)).WithErrorCode(DomainErrorCodes.Nursing.EmptySbar).WithMessage($"{name} may not be empty.")
                    .MaximumLength(MaxLength).WithErrorCode(DomainErrorCodes.Nursing.SbarExceedsMaxLength).WithMessage($"{name} may not exceed {MaxLength} characters.");
            }
        }
    }
}
