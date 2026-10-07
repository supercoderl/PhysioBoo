namespace PhysioBoo.Application.Commands.Dashboard.DismissDashboardAlert
{
    public sealed class DismissDashboardAlertCommand : CommandBase, IRequest
    {
        private static readonly DismissDashboardAlertCommandValidation s_validation = new();

        /// <summary>"{source}:{guid}" as produced by the dashboard overview.</summary>
        public string AlertId { get; }
        public string? ResolutionNote { get; }

        public DismissDashboardAlertCommand(string alertId, string? resolutionNote) : base(Guid.NewGuid())
        {
            AlertId = alertId;
            ResolutionNote = resolutionNote;
        }

        public override bool IsValid()
        {
            ValidationResult = s_validation.Validate(this);
            return ValidationResult.IsValid;
        }
    }
}
