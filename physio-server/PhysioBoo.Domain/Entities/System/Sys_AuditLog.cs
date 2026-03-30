using PhysioBoo.Domain.Enums;
using PhysioBoo.SharedKernel.Utils;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhysioBoo.Domain.Entities.System
{
    public class Sys_AuditLog : Entity
    {
        public Guid? UserId { get; private set; }
        public AuditAction Action { get; private set; }
        public string TableName { get; private set; }
        public string PrimaryKey { get; private set; }

        [Column(TypeName = "jsonb")]
        public string? OldValues { get; private set; }

        [Column(TypeName = "jsonb")]
        public string? NewValues { get; private set; }

        [Column(TypeName = "jsonb")]
        public string? AffectedColumns { get; private set; }

        public DateTimeOffset DateOccurred { get; private set; }
        public string? IpAddress { get; private set; }
        public string? UserAgent { get; private set; }
        public string? RequestId { get; private set; }

        public Sys_AuditLog(
            Guid id,
            Guid? userId,
            AuditAction action,
            string tableName,
            string primaryKey,
            string? oldValues,
            string? newValues,
            string? affectedColumns,
            string? ipAddress,
            string? userAgent,
            string? requestId
        ) : base(id)
        {
            UserId = userId;
            Action = action;
            TableName = tableName;
            PrimaryKey = primaryKey;
            OldValues = oldValues;
            NewValues = newValues;
            AffectedColumns = affectedColumns;
            DateOccurred = TimeZoneHelper.GetLocalTimeNow();
            IpAddress = ipAddress;
            UserAgent = userAgent;
            RequestId = requestId;
        }

        public void SetUserId(Guid? userId) { UserId = userId; }
        public void SetAction(AuditAction action) { Action = action; }
        public void SetTableName(string tableName) { TableName = tableName; }
        public void SetPrimaryKey(string primaryKey) { PrimaryKey = primaryKey; }
        public void SetOldValues(string? oldValues) { OldValues = oldValues; }
        public void SetNewValues(string? newValues) { NewValues = newValues; }
        public void SetAffectedColumns(string? affectedColumns) { AffectedColumns = affectedColumns; }
        public void SetDateOccurred(DateTimeOffset dateOccurred) { DateOccurred = dateOccurred; }
        public void SetIpAddress(string? ipAddress) { IpAddress = ipAddress; }
        public void SetUserAgent(string? userAgent) { UserAgent = userAgent; }
        public void SetRequestId(string? requestId) { RequestId = requestId; }
    }
}
