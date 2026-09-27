using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Suppliers.DeleteSupplier
{
    public sealed class DeleteSupplierCommandValidation : AbstractValidator<DeleteSupplierCommand>
    {
        public DeleteSupplierCommandValidation()
        {
            RuleForId();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.Id)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Supplier.EmptyId)
                .WithMessage("Id may not be empty.");
        }
    }
}
