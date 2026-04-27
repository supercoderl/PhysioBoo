using MediatR;
using PhysioBoo.Application.ViewModels.Doctors;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Doctors.CreateDoctor
{
    public sealed class CreateDoctorCommand : CommandBase, IRequest
    {
        private static readonly CreateDoctorCommandValidation s_validation = new();

        public CreateDoctorViewModel NewDoctor { get; }
        public Guid NewId { get; }

        public CreateDoctorCommand(CreateDoctorViewModel newDoctor, Guid newId) : base(Guid.NewGuid())
        {
            NewDoctor = newDoctor;
            NewId = newId;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
