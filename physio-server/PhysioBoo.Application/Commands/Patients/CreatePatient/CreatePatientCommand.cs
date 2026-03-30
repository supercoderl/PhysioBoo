using MediatR;
using PhysioBoo.Application.ViewModels.Patients;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Patients.CreatePatient
{
    public sealed class CreatePatientCommand : CommandBase, IRequest
    {
        private static readonly CreatePatientCommandValidation s_validation = new();

        public CreatePatientViewModel NewPatient { get; }

        public CreatePatientCommand(CreatePatientViewModel newPatient) : base(Guid.NewGuid())
        {
            NewPatient = newPatient;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
