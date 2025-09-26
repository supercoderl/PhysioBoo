using FluentValidation;

namespace PhysioBoo.Application.Commands.PrescriptionItems.CreatePrescriptionItem
{
    public sealed class CreatePrescriptionItemCommandValidation : AbstractValidator<CreatePrescriptionItemCommand>
    {
        public CreatePrescriptionItemCommandValidation()
        {

        }
    }
}
