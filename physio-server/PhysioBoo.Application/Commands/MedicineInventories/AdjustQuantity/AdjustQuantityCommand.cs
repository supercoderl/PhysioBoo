
using PhysioBoo.Application.ViewModels.MedicineInventories;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.MedicineInventories.AdjustQuantity
{
    public sealed class AdjustQuantityCommand : CommandBase, IRequest
    {
        private static readonly AdjustQuantityCommandValidation s_validation = new();

        public AdjustQuantityViewModel AdjustQuantity { get; }
        public Guid Id { get; }

        public AdjustQuantityCommand(AdjustQuantityViewModel adjustQuantity, Guid id) : base(Guid.NewGuid())
        {
            AdjustQuantity = adjustQuantity;
            Id = id;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
