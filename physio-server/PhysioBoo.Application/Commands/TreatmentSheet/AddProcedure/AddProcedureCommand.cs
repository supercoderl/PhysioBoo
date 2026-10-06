using PhysioBoo.Application.ViewModels.TreatmentSheet;

namespace PhysioBoo.Application.Commands.TreatmentSheet.AddProcedure
{
    public sealed class AddProcedureCommand : CommandBase, IRequest
    {
        private static readonly AddProcedureCommandValidation s_validation = new();

        public Guid PatientId { get; }
        public AddProcedureViewModel Input { get; }

        // Filled by the handler so the endpoint can return the new procedure.
        public TreatmentProcedureRowViewModel? Result { get; set; }

        public AddProcedureCommand(Guid patientId, AddProcedureViewModel input) : base(Guid.NewGuid())
        {
            PatientId = patientId;
            Input = input;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
