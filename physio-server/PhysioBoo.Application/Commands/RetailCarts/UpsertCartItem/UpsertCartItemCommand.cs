
using PhysioBoo.Application.ViewModels.Retail;


namespace PhysioBoo.Application.Commands.RetailCarts.UpsertCartItem
{
    public sealed class UpsertCartItemCommand : CommandBase, IRequest
    {
        private static readonly UpsertCartItemCommandValidation s_validation = new();

        public Guid CartId { get; }
        public Guid MedicineId { get; }
        public UpsertCartItemViewModel Item { get; }

        public UpsertCartItemCommand(Guid cartId, Guid medicineId, UpsertCartItemViewModel item) : base(Guid.NewGuid())
        {
            CartId = cartId;
            MedicineId = medicineId;
            Item = item;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
