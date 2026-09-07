
using PhysioBoo.Application.ViewModels.Medicines;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Medicines.UpdateMedicine
{
    public sealed class UpdateMedicineCommand : CommandBase, IRequest
    {
        private static readonly UpdateMedicineCommandValidation s_validation = new();

        public UpdateMedicineViewModel Medicine { get; }
        public Guid Id { get; }

        public UpdateMedicineCommand(UpdateMedicineViewModel medicine, Guid id) : base(Guid.NewGuid())
        {
            Medicine = medicine;
            Id = id;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
