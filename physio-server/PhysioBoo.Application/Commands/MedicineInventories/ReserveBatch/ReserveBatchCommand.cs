
using PhysioBoo.Application.ViewModels.MedicineInventories;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.MedicineInventories.ReserveBatch
{
    public sealed class ReserveBatchCommand : CommandBase, IRequest
    {
        private static readonly ReserveBatchCommandValidation s_validation = new();

        public ReserveBatchViewModel ReserveBatch { get; }
        public Guid Id { get; }

        public ReserveBatchCommand(ReserveBatchViewModel reserveBatch, Guid id) : base(Guid.NewGuid())
        {
            ReserveBatch = reserveBatch;
            Id = id;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
