using MediatR;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Patients.InvitePatient
{
    public sealed class InvitePatientToPortalCommand : CommandBase, IRequest
    {
        private static readonly InvitePatientToPortalCommandValidation s_validation = new();

        public Guid PatientId { get; }

        public InvitePatientToPortalCommand(Guid patientId) : base(Guid.NewGuid())
        {
            PatientId = patientId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
