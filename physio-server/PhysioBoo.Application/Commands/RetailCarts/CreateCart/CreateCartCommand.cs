
using PhysioBoo.Application.ViewModels.Retail;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.RetailCarts.CreateCart
{
    public sealed class CreateCartCommand : CommandBase, IRequest
    {
        private static readonly CreateCartCommandValidation s_validation = new();

        public CreateCartViewModel NewCart { get; }

        public CreateCartCommand(CreateCartViewModel newCart) : base(Guid.NewGuid())
        {
            NewCart = newCart;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
