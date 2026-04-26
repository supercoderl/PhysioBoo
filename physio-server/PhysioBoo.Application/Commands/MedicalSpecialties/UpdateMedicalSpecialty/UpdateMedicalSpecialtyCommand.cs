using PhysioBoo.Application.ViewModels.MedicalSpecialties;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.MedicalSpecialties.UpdateMedicalSpecialty
{
    public sealed class UpdateMedicalSpecialtyCommand : CommandBase
    {
        private static readonly UpdateMedicalSpecialtyCommandValidation s_validation = new();

        public UpdateMedicalSpecialtyViewModel MedicalSpecialty { get; }
        public Guid Id { get; }

        public UpdateMedicalSpecialtyCommand(UpdateMedicalSpecialtyViewModel medicalSpecialty, Guid id) : base(Guid.NewGuid())
        {
            MedicalSpecialty = medicalSpecialty;
            Id = id;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
