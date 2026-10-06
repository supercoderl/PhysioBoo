using PhysioBoo.Application.ViewModels.Admissions;

namespace PhysioBoo.Application.Commands.Admissions.UpdateAdmission
{
    public sealed class UpdateAdmissionCommand : CommandBase, IRequest
    {
        private static readonly UpdateAdmissionCommandValidation s_validation = new();

        public Guid Id { get; }
        public UpdateAdmissionViewModel Admission { get; }

        public UpdateAdmissionCommand(Guid id, UpdateAdmissionViewModel admission) : base(Guid.NewGuid())
        {
            Id = id;
            Admission = admission;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
