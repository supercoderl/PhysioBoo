using PhysioBoo.Application.ViewModels.Nursing;

namespace PhysioBoo.Application.Commands.Nursing.AcknowledgeHandover
{
    public sealed class AcknowledgeHandoverCommand : CommandBase, IRequest
    {
        private static readonly AcknowledgeHandoverCommandValidation s_validation = new();

        public Guid CardId { get; }

        // Filled by the handler so the endpoint can return the card.
        public ShiftHandoverCardViewModel? Result { get; set; }

        public AcknowledgeHandoverCommand(Guid cardId) : base(Guid.NewGuid())
        {
            CardId = cardId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
