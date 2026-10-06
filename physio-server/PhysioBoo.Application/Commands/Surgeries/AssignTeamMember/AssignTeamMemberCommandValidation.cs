using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Surgeries.AssignTeamMember
{
    public sealed class AssignTeamMemberCommandValidation : AbstractValidator<AssignTeamMemberCommand>
    {
        public AssignTeamMemberCommandValidation()
        {
            RuleFor(c => c.SurgeryId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Surgery.EmptyId).WithMessage("Surgery id may not be empty.");

            RuleFor(c => c.MemberId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Surgery.EmptyId).WithMessage("Team member id may not be empty.");

            RuleFor(c => c.Input.StaffId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Surgery.EmptyStaffId).WithMessage("Staff id may not be empty.");

            RuleFor(c => c.Input.Role)
                .Must(v => Enum.TryParse(v, true, out SurgicalTeamRole _))
                .WithErrorCode(DomainErrorCodes.Surgery.InvalidRole).WithMessage("Role is not a valid surgical team role.");
        }
    }
}
