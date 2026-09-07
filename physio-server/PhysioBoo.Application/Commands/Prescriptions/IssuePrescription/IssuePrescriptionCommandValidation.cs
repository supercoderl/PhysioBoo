

namespace PhysioBoo.Application.Commands.Prescriptions.IssuePrescription
{
    public sealed class IssuePrescriptionCommandValidation : AbstractValidator<IssuePrescriptionCommand>
    {
        public IssuePrescriptionCommandValidation()
        {
            RuleFor(c => c.PrescriptionId).NotEmpty();
        }
    }
}
