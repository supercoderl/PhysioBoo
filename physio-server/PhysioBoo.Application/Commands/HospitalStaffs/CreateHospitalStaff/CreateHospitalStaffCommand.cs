using FluentValidation.Results;
using MediatR;
using PhysioBoo.Application.ViewModels.HospitalStaffs;
using PhysioBoo.SharedKernel.Commands;

namespace PhysioBoo.Application.Commands.HospitalStaffs.CreateHospitalStaff
{
    public sealed class CreateHospitalStaffCommand : CommandBase, IRequest
    {
        private static readonly CreateHospitalStaffCommandValidation s_validation = new();

        public CreateHospitalStaffViewModel NewHospitalStaff { get; }

        public CreateHospitalStaffCommand(CreateHospitalStaffViewModel newHospitalStaff) : base(Guid.NewGuid())
        {
            NewHospitalStaff = newHospitalStaff;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}