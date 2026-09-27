using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Leads.DeleteLead
{
    public sealed class DeleteLeadCommandValidation : AbstractValidator<DeleteLeadCommand>
    {
        public DeleteLeadCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Lead.EmptyId).WithMessage("Id may not be empty.");
        }
    }
}
