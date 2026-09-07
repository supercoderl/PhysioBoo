using PhysioBoo.Domain.Entities.System;

namespace PhysioBoo.Application.ViewModels.AuditLogs
{
    public sealed class AuditLogViewModel
    {
        public Guid Id { get; set; }
        public Guid? UserId { get; set; }
        public string? UserEmail { get; set; }
        public string Action { get; set; } = string.Empty;
        public string TableName { get; set; } = string.Empty;
        public string PrimaryKey { get; set; } = string.Empty;
        public string? OldValues { get; set; }
        public string? NewValues { get; set; }
        public string? AffectedColumns { get; set; }
        public DateTimeOffset DateOccurred { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
        public string? RequestId { get; set; }

        public static AuditLogViewModel FromEntity(Sys_AuditLog log, string? userEmail)
        {
            return new AuditLogViewModel
            {
                Id = log.Id,
                UserId = log.UserId,
                UserEmail = userEmail,
                Action = log.Action.ToString(),
                TableName = log.TableName,
                PrimaryKey = log.PrimaryKey,
                OldValues = log.OldValues,
                NewValues = log.NewValues,
                AffectedColumns = log.AffectedColumns,
                DateOccurred = log.DateOccurred,
                IpAddress = log.IpAddress,
                UserAgent = log.UserAgent,
                RequestId = log.RequestId
            };
        }
    }
}
