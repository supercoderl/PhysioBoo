using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Leads.CreateLead
{
    public sealed class CreateLeadCommandValidation : AbstractValidator<CreateLeadCommand>
    {
        public CreateLeadCommandValidation()
        {
            RuleFor(c => c.NewLead.Name)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Lead.EmptyName).WithMessage("Name may not be empty.")
                .MaximumLength(120).WithErrorCode(DomainErrorCodes.Lead.NameExceedsMaxLength).WithMessage("Name may not exceed 120 characters.");

            RuleFor(c => c.NewLead.Phone)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Lead.EmptyPhone).WithMessage("Phone may not be empty.")
                .MaximumLength(32).WithErrorCode(DomainErrorCodes.Lead.PhoneExceedsMaxLength).WithMessage("Phone may not exceed 32 characters.");

            RuleFor(c => c.NewLead.Email)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Lead.EmptyEmail).WithMessage("Email may not be empty.")
                .EmailAddress().WithErrorCode(DomainErrorCodes.Lead.InvalidEmail).WithMessage("Email is not valid.")
                .MaximumLength(254).WithErrorCode(DomainErrorCodes.Lead.EmailExceedsMaxLength).WithMessage("Email may not exceed 254 characters.");

            RuleFor(c => c.NewLead.Service)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Lead.EmptyService).WithMessage("Service may not be empty.");

            RuleFor(c => c.NewLead.Source)
                .NotEmpty().WithErrorCode(DomainErrorCodes.Lead.EmptySource).WithMessage("Source may not be empty.");

            RuleFor(c => c.NewLead.Status)
                .Must(v => Enum.TryParse(v, true, out LeadStatus s) && Enum.IsDefined(s))
                .WithErrorCode(DomainErrorCodes.Lead.InvalidStatus).WithMessage("Status is not valid.");

            RuleFor(c => c.NewLead.Priority)
                .Must(v => Enum.TryParse(v, true, out LeadPriority p) && Enum.IsDefined(p))
                .WithErrorCode(DomainErrorCodes.Lead.InvalidPriority).WithMessage("Priority is not valid.");

            RuleFor(c => c.NewLead.Notes)
                .MaximumLength(2000).WithErrorCode(DomainErrorCodes.Lead.NotesExceedsMaxLength).WithMessage("Notes may not exceed 2000 characters.")
                .When(c => c.NewLead.Notes != null);
        }
    }
}
