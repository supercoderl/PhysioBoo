using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.AppointmentTypes.DeleteAppointmentType
{
    public sealed class DeleteAppointmentTypeCommand : CommandBase
    {
        private static readonly DeleteAppointmentTypeCommandValidation s_validation = new();

        public Guid Id { get; }
        public bool IsHard { get; }

        public DeleteAppointmentTypeCommand(
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
