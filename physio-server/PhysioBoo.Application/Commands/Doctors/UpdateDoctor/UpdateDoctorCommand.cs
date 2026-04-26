using MediatR;
using PhysioBoo.Application.ViewModels.Doctors;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.Doctors.UpdateDoctor
{
    public sealed class UpdateDoctorCommand : CommandBase, IRequest
    {
        private static readonly UpdateDoctorCommandValidation _validation = new();

        public UpdateDoctorViewModel Doctor { get; }
        public Guid Id { get; }

        public UpdateDoctorCommand(
            UpdateDoctorViewModel doctor,
            Guid id
        ) : base(Guid.NewGuid())
        {
            Doctor = doctor;
            Id = id;
        }

        public override bool IsValid()
        {
            FluentValidation.Results.ValidationResult validationResult = _validation.Validate(this);
            return validationResult.IsValid;
        }
    }
}
