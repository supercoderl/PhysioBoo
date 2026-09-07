

namespace PhysioBoo.Application.Commands.RetailCarts.ResumeCart
{
    public sealed class ResumeCartCommandValidation : AbstractValidator<ResumeCartCommand>
    {
        public ResumeCartCommandValidation()
        {
            RuleFor(cmd => cmd.CartId).NotEmpty();
        }
    }
}
