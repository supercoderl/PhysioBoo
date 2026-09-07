using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Medicines.DeleteMedicine
{
    public sealed class DeleteMedicineCommand : CommandBase
    {
        private static readonly DeleteMedicineCommandValidation s_validation = new();

        public Guid Id { get; }
        public bool IsHard { get; }

        public DeleteMedicineCommand(
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
