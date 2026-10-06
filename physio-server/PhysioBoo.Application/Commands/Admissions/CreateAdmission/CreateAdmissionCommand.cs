using PhysioBoo.Application.ViewModels.Admissions;

namespace PhysioBoo.Application.Commands.Admissions.CreateAdmission
{
    public sealed class CreateAdmissionCommand : CommandBase, IRequest
    {
        private static readonly CreateAdmissionCommandValidation s_validation = new();

        public Guid NewId { get; }
        public CreateAdmissionViewModel NewAdmission { get; }

        public CreateAdmissionCommand(Guid newId, CreateAdmissionViewModel newAdmission) : base(Guid.NewGuid())
        {
            NewId = newId;
            NewAdmission = newAdmission;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
