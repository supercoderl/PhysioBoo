using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Nursing.AcknowledgeHandover
{
    public sealed class AcknowledgeHandoverCommandValidation : AbstractValidator<AcknowledgeHandoverCommand>
    {
        public AcknowledgeHandoverCommandValidation()
        {
            RuleFor(c => c.CardId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Nursing.EmptyId).WithMessage("Card id may not be empty.");
        }
    }
}
