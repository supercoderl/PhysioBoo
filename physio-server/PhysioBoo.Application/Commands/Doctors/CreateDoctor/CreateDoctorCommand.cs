using MediatR;
using PhysioBoo.Application.ViewModels.Doctors;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Doctors.CreateDoctor
{
    public sealed class CreateDoctorCommand : CommandBase, IRequest
    {
        private static readonly CreateDoctorValidation s_validation = new();

        public Guid Id { get; }
        public CreateDoctorViewModel NewDoctor { get; }

        public CreateDoctorCommand(Guid id, CreateDoctorViewModel newDoctor) : base(Guid.NewGuid())
        {
            Id = id;
            NewDoctor = newDoctor;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
