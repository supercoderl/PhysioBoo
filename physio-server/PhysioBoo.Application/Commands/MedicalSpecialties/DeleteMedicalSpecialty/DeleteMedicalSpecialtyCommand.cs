using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.MedicalSpecialties.DeleteMedicalSpecialty
{
    public sealed class DeleteMedicalSpecialtyCommand : CommandBase
    {
        private static readonly DeleteMedicalSpecialtyCommandValidation s_validation = new();

        public Guid Id { get; }
        public bool IsHard { get; }

        public DeleteMedicalSpecialtyCommand(
            Guid id,
            bool isHard = false
        ) : base(Guid.NewGuid())
        {
            Id = id;
            IsHard = isHard;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
