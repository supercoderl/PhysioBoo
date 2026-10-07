using PhysioBoo.Application.Queries.Dashboard;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Dashboard.DismissDashboardAlert
{
    public sealed class DismissDashboardAlertCommandValidation : AbstractValidator<DismissDashboardAlertCommand>
    {
        public DismissDashboardAlertCommandValidation()
        {
            RuleFor(c => c.AlertId)
                .Must(id => DashboardAlertSource.TryParse(id, out _, out _))
                .WithErrorCode(DomainErrorCodes.DashboardAlert.InvalidId)
                .WithMessage("Alert id must look like 'lab:{guid}', 'rad:{guid}', 'sur:{guid}', 'cli:{guid}' or 'inv:{guid}'.");

            RuleFor(c => c.ResolutionNote)
                .MaximumLength(500).WithErrorCode(DomainErrorCodes.DashboardAlert.NoteExceedsMaxLength).WithMessage("Resolution note may not exceed 500 characters.");
        }
    }
}
