using PhysioBoo.Application.ViewModels.BedMap;

namespace PhysioBoo.Application.Commands.BedMap.CreateBed
{
    public sealed class CreateBedCommand : CommandBase, IRequest
    {
        private static readonly CreateBedCommandValidation s_validation = new();

        public Guid NewId { get; }
        public CreateBedViewModel NewBed { get; }

        public CreateBedCommand(Guid newId, CreateBedViewModel newBed) : base(Guid.NewGuid())
        {
            NewId = newId;
            NewBed = newBed;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
