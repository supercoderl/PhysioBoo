using PhysioBoo.Application.ViewModels.Nursing;

namespace PhysioBoo.Application.Commands.Nursing.UpdateHandover
{
    public sealed class UpdateHandoverCommand : CommandBase, IRequest
    {
        private static readonly UpdateHandoverCommandValidation s_validation = new();

        public Guid CardId { get; }
        public UpdateHandoverViewModel Sbar { get; }
        public ShiftHandoverCardViewModel? Result { get; set; }

        public UpdateHandoverCommand(Guid cardId, UpdateHandoverViewModel sbar) : base(Guid.NewGuid())
        {
            CardId = cardId;
            Sbar = sbar;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
