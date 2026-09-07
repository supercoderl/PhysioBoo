

namespace PhysioBoo.Application.Commands.RetailCarts.AttachCustomer
{
    public sealed class AttachCustomerCommandValidation : AbstractValidator<AttachCustomerCommand>
    {
        public AttachCustomerCommandValidation()
        {
            RuleFor(cmd => cmd.CartId).NotEmpty();
            RuleFor(cmd => cmd.Customer.FullName).NotEmpty();
            RuleFor(cmd => cmd.Customer.Type).Must(t => t == "Patient" || t == "WalkIn")
                .WithMessage("Type must be 'Patient' or 'WalkIn'.");
        }
    }
}
