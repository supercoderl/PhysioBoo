using FluentValidation.Results;
using MediatR;
using PhysioBoo.Application.ViewModels.DoctorLeaves;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.DoctorLeaves.CreateDoctorLeave
{
    public sealed class CreateDoctorLeaveCommand : CommandBase, IRequest
    {
        private static readonly CreateDoctorLeaveCommandValidation _validation = new();

        public CreateDoctorLeaveViewModel NewDoctorLeave { get; }

        public CreateDoctorLeaveCommand(CreateDoctorLeaveViewModel newDoctorLeave) : base(Guid.NewGuid())
        {
            NewDoctorLeave = newDoctorLeave;
        }

        public override bool IsValid()
        {
            ValidationResult = _validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}