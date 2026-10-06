using PhysioBoo.Application.ViewModels.Admissions;

namespace PhysioBoo.Application.Commands.Admissions.DischargeAdmission
{
    public sealed class DischargeAdmissionCommand : CommandBase, IRequest
    {
        private static readonly DischargeAdmissionCommandValidation s_validation = new();

        public Guid Id { get; }
        public DischargeAdmissionViewModel Input { get; }

        public DischargeAdmissionCommand(Guid id, DischargeAdmissionViewModel input) : base(Guid.NewGuid())
        {
            Id = id;
            Input = input;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
