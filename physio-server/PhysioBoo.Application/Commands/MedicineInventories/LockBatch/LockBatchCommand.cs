
using PhysioBoo.Application.ViewModels.MedicineInventories;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.MedicineInventories.LockBatch
{
    public sealed class LockBatchCommand : CommandBase, IRequest
    {
        private static readonly LockBatchCommandValidation s_validation = new();

        public LockBatchViewModel LockBatch { get; }
        public Guid Id { get; }

        public LockBatchCommand(LockBatchViewModel lockBatch, Guid id) : base(Guid.NewGuid())
        {
            LockBatch = lockBatch;
            Id = id;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
