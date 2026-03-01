using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Manufacturers.DeleteManufacturer
{
    public sealed class DeleteManufacturerCommand : CommandBase
    {
        private static readonly DeleteManufacturerCommandValidation s_validation = new();

        public Guid Id { get; }
        public bool IsHard { get; }

        public DeleteManufacturerCommand(
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
