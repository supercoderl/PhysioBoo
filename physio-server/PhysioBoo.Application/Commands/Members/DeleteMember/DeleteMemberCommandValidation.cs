using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Members.DeleteMember
{
    public sealed class DeleteMemberCommandValidation : AbstractValidator<DeleteMemberCommand>
    {
        public DeleteMemberCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Member.EmptyId).WithMessage("Id may not be empty.");
        }
    }
}
