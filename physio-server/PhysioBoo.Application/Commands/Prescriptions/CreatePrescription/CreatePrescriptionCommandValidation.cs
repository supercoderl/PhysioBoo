using FluentValidation;

namespace PhysioBoo.Application.Commands.Prescriptions.CreatePrescription
{
    public sealed class CreatePrescriptionCommandValidation : AbstractValidator<CreatePrescriptionCommand>
    {
        public CreatePrescriptionCommandValidation()
        {

        }
    }
}
