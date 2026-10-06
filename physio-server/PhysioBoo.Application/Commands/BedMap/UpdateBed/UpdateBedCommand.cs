using PhysioBoo.Application.ViewModels.BedMap;

namespace PhysioBoo.Application.Commands.BedMap.UpdateBed
{
    public sealed class UpdateBedCommand : CommandBase, IRequest
    {
        private static readonly UpdateBedCommandValidation s_validation = new();

        public Guid Id { get; }
        public UpdateBedViewModel Bed { get; }

        public UpdateBedCommand(Guid id, UpdateBedViewModel bed) : base(Guid.NewGuid())
        {
            Id = id;
            Bed = bed;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
