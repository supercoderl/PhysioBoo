using FluentValidation;

namespace PhysioBoo.Application.Commands.Suppliers.DeleteSupplier
{
    public sealed class DeleteSupplierCommandValidation : AbstractValidator<DeleteSupplierCommand>
    {
        public DeleteSupplierCommandValidation()
        {

        }
    }
}
