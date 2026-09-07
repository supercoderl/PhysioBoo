

namespace PhysioBoo.Application.Commands.RetailCarts.SuspendCart
{
    public sealed class SuspendCartCommandValidation : AbstractValidator<SuspendCartCommand>
    {
        public SuspendCartCommandValidation()
        {
            RuleFor(cmd => cmd.CartId).NotEmpty();
        }
    }
}
