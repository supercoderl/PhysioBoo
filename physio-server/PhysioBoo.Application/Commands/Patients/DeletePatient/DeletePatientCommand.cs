using MediatR;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Patients.DeletePatient
{
    public sealed class DeletePatientCommand : CommandBase, IRequest
    {
        private static readonly DeletePatientCommandValidation s_validation = new();

        public Guid Id { get; set; }
        public bool IsHard { get; set; }

        public DeletePatientCommand(Guid id, bool isHard = false) : base(Guid.NewGuid())
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
