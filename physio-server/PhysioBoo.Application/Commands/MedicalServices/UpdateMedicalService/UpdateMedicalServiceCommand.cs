using PhysioBoo.Application.ViewModels.MedicalServices;

namespace PhysioBoo.Application.Commands.MedicalServices.UpdateMedicalService
{
    public sealed class UpdateMedicalServiceCommand : CommandBase, IRequest
    {
        private static readonly UpdateMedicalServiceCommandValidation s_validation = new();

        public Guid Id { get; }
        public UpdateMedicalServiceViewModel MedicalService { get; }

        public UpdateMedicalServiceCommand(Guid id, UpdateMedicalServiceViewModel medicalService) : base(Guid.NewGuid())
        {
            Id = id;
            MedicalService = medicalService;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
