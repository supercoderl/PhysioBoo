using PhysioBoo.Application.ViewModels.MedicalServices;

namespace PhysioBoo.Application.Commands.MedicalServices.CreateMedicalService
{
    public sealed class CreateMedicalServiceCommand : CommandBase, IRequest
    {
        private static readonly CreateMedicalServiceCommandValidation s_validation = new();

        public Guid NewId { get; }
        public CreateMedicalServiceViewModel NewMedicalService { get; }

        public CreateMedicalServiceCommand(Guid newId, CreateMedicalServiceViewModel newMedicalService) : base(Guid.NewGuid())
        {
            NewId = newId;
            NewMedicalService = newMedicalService;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
