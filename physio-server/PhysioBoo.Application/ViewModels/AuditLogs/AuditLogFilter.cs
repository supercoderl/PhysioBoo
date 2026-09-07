namespace PhysioBoo.Application.ViewModels.AuditLogs
{
    public sealed class AuditLogFilter
    {
        public string? TableName { get; set; }
        public string? Action { get; set; }
        public Guid? UserId { get; set; }
        public DateTimeOffset? DateFrom { get; set; }
        public DateTimeOffset? DateTo { get; set; }
    }
}
