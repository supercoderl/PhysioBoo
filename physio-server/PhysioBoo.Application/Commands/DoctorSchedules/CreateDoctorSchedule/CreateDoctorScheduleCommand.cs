using FluentValidation.Results;
using MediatR;
using PhysioBoo.Application.ViewModels.DoctorSchedules;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.DoctorSchedules.CreateDoctorSchedule
{
    public sealed class CreateDoctorScheduleCommand : CommandBase, IRequest
    {
        private static readonly CreateDoctorScheduleCommandValidation s_validation = new();

        public CreateDoctorScheduleViewModel NewDoctorSchedule { get; }

        public CreateDoctorScheduleCommand(CreateDoctorScheduleViewModel newDoctorSchedule) : base(Guid.NewGuid())
        {
            NewDoctorSchedule = newDoctorSchedule;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}