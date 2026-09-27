using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Leads.UpdateLead
{
    public sealed class UpdateLeadCommandValidation : AbstractValidator<UpdateLeadCommand>
    {
        public UpdateLeadCommandValidation()
        {
            RuleFor(c => c.Id)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Lead.EmptyId).WithMessage("Id may not be empty.");

            RuleFor(c => c.Lead.Name)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Lead.EmptyName).WithMessage("Name may not be empty.")
                .MaximumLength(120).WithErrorCode(DomainErrorCodes.Lead.NameExceedsMaxLength).WithMessage("Name may not exceed 120 characters.");

            RuleFor(c => c.Lead.Phone)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Lead.EmptyPhone).WithMessage("Phone may not be empty.")
                .MaximumLength(32).WithErrorCode(DomainErrorCodes.Lead.PhoneExceedsMaxLength).WithMessage("Phone may not exceed 32 characters.");

            RuleFor(c => c.Lead.Email)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Lead.EmptyEmail).WithMessage("Email may not be empty.")
                .EmailAddress().WithErrorCode(DomainErrorCodes.Lead.InvalidEmail).WithMessage("Email is not valid.")
                .MaximumLength(254).WithErrorCode(DomainErrorCodes.Lead.EmailExceedsMaxLength).WithMessage("Email may not exceed 254 characters.");

            RuleFor(c => c.Lead.Service)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Lead.EmptyService).WithMessage("Service may not be empty.");

            RuleFor(c => c.Lead.Source)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Lead.EmptySource).WithMessage("Source may not be empty.");

            RuleFor(c => c.Lead.Status)
                .Must(v => Enum.TryParse(v, true, out LeadStatus s) && Enum.IsDefined(s))
                .WithErrorCode(DomainErrorCodes.Lead.InvalidStatus).WithMessage("Status is not valid.");

            RuleFor(c => c.Lead.Priority)
                .Must(v => Enum.TryParse(v, true, out LeadPriority p) && Enum.IsDefined(p))
                .WithErrorCode(DomainErrorCodes.Lead.InvalidPriority).WithMessage("Priority is not valid.");

            RuleFor(c => c.Lead.Notes)
                .MaximumLength(2000).WithErrorCode(DomainErrorCodes.Lead.NotesExceedsMaxLength).WithMessage("Notes may not exceed 2000 characters.")
                .When(c => c.Lead.Notes != null);
        }
    }
}
