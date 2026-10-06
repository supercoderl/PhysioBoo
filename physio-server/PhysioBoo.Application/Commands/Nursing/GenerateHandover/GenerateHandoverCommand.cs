using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.Commands.Nursing.GenerateHandover
{
    // Creates the SBAR cards of the outgoing shift that do not exist yet. Safe to run repeatedly.
    public sealed class GenerateHandoverCommand : CommandBase, IRequest
    {
        private static readonly GenerateHandoverCommandValidation s_validation = new();

        public ShiftCode OutgoingShift { get; }

        public GenerateHandoverCommand(ShiftCode outgoingShift) : base(Guid.NewGuid())
        {
            OutgoingShift = outgoingShift;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
