using PhysioBoo.Application.ViewModels.Dispensing;

namespace PhysioBoo.Application.Commands.Dispensing.CompleteDispensing
{
    public sealed class CompleteDispensingCommand : CommandBase, IRequest
    {
        private static readonly CompleteDispensingCommandValidation s_validation = new();

        public Guid PrescriptionId { get; }
        public string? PharmacistNotes { get; }

        /// <summary>
        /// Set by the handler when dispensing succeeds.
        /// </summary>
        public DispenseSummaryViewModel? Summary { get; set; }

        public CompleteDispensingCommand(Guid prescriptionId, string? pharmacistNotes) : base(prescriptionId)
        {
            PrescriptionId = prescriptionId;
            PharmacistNotes = pharmacistNotes;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
