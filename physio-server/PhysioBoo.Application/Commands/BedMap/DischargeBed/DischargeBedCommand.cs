using PhysioBoo.Application.ViewModels.BedMap;

namespace PhysioBoo.Application.Commands.BedMap.DischargeBed
{
    public sealed class DischargeBedCommand : CommandBase, IRequest
    {
        private static readonly DischargeBedCommandValidation s_validation = new();

        public Guid BedId { get; }
        public DischargeBedViewModel Input { get; }

        public DischargeBedCommand(Guid bedId, DischargeBedViewModel input) : base(Guid.NewGuid())
        {
            BedId = bedId;
            Input = input;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
