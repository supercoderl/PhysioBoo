

namespace PhysioBoo.Application.Commands.RetailCarts.CreateCart
{
    public sealed class CreateCartCommandValidation : AbstractValidator<CreateCartCommand>
    {
        public CreateCartCommandValidation()
        {
            RuleFor(cmd => cmd.NewCart.Id).NotEmpty();
            RuleFor(cmd => cmd.NewCart.HospitalId).NotEmpty();
        }
    }
}
