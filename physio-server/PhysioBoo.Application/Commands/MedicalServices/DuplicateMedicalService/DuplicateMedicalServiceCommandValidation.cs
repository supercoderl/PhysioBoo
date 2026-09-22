namespace PhysioBoo.Application.Commands.MedicalServices.DuplicateMedicalService
{
    public sealed class DuplicateMedicalServiceCommandValidation : AbstractValidator<DuplicateMedicalServiceCommand>
    {
        public DuplicateMedicalServiceCommandValidation()
        {
            RuleFor(c => c.SourceId).NotEmpty();
        }
    }
}