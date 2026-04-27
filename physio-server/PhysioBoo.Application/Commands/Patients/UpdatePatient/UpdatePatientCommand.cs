using MediatR;
using PhysioBoo.Application.ViewModels.Patients;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Patients.UpdatePatient
{
    public sealed class UpdatePatientCommand : CommandBase, IRequest
    {
        private static readonly UpdatePatientCommandValidation s_validation = new();

        public UpdatePatientViewModel Patient { get; }
        public Guid Id { get; }

        public UpdatePatientCommand(Guid id, UpdatePatientViewModel patient) : base(Guid.NewGuid())
        {
            Id = id;
            Patient = patient;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
