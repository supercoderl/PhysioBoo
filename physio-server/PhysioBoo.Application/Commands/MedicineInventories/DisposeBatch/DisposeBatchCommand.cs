
using PhysioBoo.Application.ViewModels.MedicineInventories;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.MedicineInventories.DisposeBatch
{
    public sealed class DisposeBatchCommand : CommandBase, IRequest
    {
        private static readonly DisposeBatchCommandValidation s_validation = new();

        public DisposeBatchViewModel DisposeBatch { get; }
        public Guid Id { get; }

        public DisposeBatchCommand(DisposeBatchViewModel disposeBatch, Guid id) : base(Guid.NewGuid())
        {
            DisposeBatch = disposeBatch;
            Id = id;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
