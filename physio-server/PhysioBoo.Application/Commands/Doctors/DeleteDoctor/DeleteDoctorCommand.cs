using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Doctors.DeleteDoctor
{
    public sealed class DeleteDoctorCommand : CommandBase
    {
        private static readonly DeleteDoctorCommandValidation s_validation = new();

        public Guid Id { get; }
        public bool IsHard { get; }

        public DeleteDoctorCommand(
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
