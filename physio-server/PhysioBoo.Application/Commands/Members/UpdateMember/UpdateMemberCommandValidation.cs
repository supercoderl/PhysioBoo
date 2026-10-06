using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Members.UpdateMember
{
    public sealed class UpdateMemberCommandValidation : AbstractValidator<UpdateMemberCommand>
    {
        public UpdateMemberCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Member.EmptyId).WithMessage("Id may not be empty.");

            RuleFor(c => c.Member.Tier)
                .Must(v => Enum.TryParse(v, true, out MembershipTier t) && Enum.IsDefined(t))
                .WithErrorCode(DomainErrorCodes.Member.InvalidTier).WithMessage("Membership tier is not valid.");

            RuleFor(c => c.Member.Status)
                .Must(v => Enum.TryParse(v, true, out MemberStatus s) && Enum.IsDefined(s))
                .WithErrorCode(DomainErrorCodes.Member.InvalidStatus).WithMessage("Status is not valid.");
        }
    }
}
