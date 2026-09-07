
using PhysioBoo.Application.ViewModels.MedicineInventories;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.MedicineInventories.TransferBatch
{
    public sealed class TransferBatchCommand : CommandBase, IRequest
    {
        private static readonly TransferBatchCommandValidation s_validation = new();

        public TransferBatchViewModel TransferBatch { get; }
        public Guid Id { get; }

        public TransferBatchCommand(TransferBatchViewModel transferBatch, Guid id) : base(Guid.NewGuid())
        {
            TransferBatch = transferBatch;
            Id = id;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
