using PhysioBoo.Application.Extensions.Validation;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Departments.UpdateDepartment
{
    public sealed class UpdateDepartmentCommandValidation : AbstractValidator<UpdateDepartmentCommand>
    {
        public UpdateDepartmentCommandValidation()
        {
            RuleForId();
            RuleForHospitalId();
            RuleForName();
            RuleForDetails();
            RuleForBedCount();
        }

        public void RuleForId()
        {
            RuleFor(cmd => cmd.NewId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Department.EmptyId)
                .WithMessage("Id may not be empty.");
        }

        public void RuleForHospitalId()
        {
            RuleFor(cmd => cmd.Department.HospitalId)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Department.EmptyHospitalId)
                .WithMessage("Hospital id may not be empty.");
        }

        public void RuleForName()
        {
            RuleFor(cmd => cmd.Department.Name)
                .NotEmpty()
                .WithErrorCode(DomainErrorCodes.Department.EmptyName)
                .WithMessage("Name may not be empty.")
                .MaximumLength(255)
                .WithErrorCode(DomainErrorCodes.Validation.ExceedsMaxLength)
                .WithMessage("Name may not be longer than 255 characters.");
        }

        public void RuleForDetails()
        {
            RuleFor(cmd => cmd.Department.DepartmentCode).MaxLen(20, "Department code");
            RuleFor(cmd => cmd.Department.Wing).MaxLen(50, "Wing");
            RuleFor(cmd => cmd.Department.Phone).MaxLen(20, "Phone").OptionalPhone("Phone");
            RuleFor(cmd => cmd.Department.Email).MaxLen(100, "Email").OptionalEmail("Email");
            RuleFor(cmd => cmd.Department.BudgetAllocated).NotNegative("Budget allocated");
        }

        public void RuleForBedCount()
        {
            RuleFor(cmd => cmd.Department.BedCount).NotNegative("Bed count");
        }
    }
}
