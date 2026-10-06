using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Members.EnrollMember
{
    public sealed class EnrollMemberCommandValidation : AbstractValidator<EnrollMemberCommand>
    {
        public EnrollMemberCommandValidation()
        {
            RuleFor(c => c.NewMember.PatientId)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Member.EmptyPatientId).WithMessage("Patient may not be empty.");

            RuleFor(c => c.NewMember.Tier)
                .Must(v => Enum.TryParse(v, true, out MembershipTier t) && Enum.IsDefined(t))
                .WithErrorCode(DomainErrorCodes.Member.InvalidTier).WithMessage("Membership tier is not valid.");
        }
    }
}
