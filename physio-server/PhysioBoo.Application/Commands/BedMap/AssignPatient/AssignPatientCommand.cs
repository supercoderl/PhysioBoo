using PhysioBoo.Application.ViewModels.BedMap;

namespace PhysioBoo.Application.Commands.BedMap.AssignPatient
{
    public sealed class AssignPatientCommand : CommandBase, IRequest
    {
        private static readonly AssignPatientCommandValidation s_validation = new();

        public Guid BedId { get; }
        public AssignPatientViewModel Input { get; }

        public AssignPatientCommand(Guid bedId, AssignPatientViewModel input) : base(Guid.NewGuid())
        {
            BedId = bedId;
            Input = input;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
