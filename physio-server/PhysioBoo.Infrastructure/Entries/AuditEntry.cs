using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using PhysioBoo.Domain.Entities.System;
using PhysioBoo.Domain.Enums;
using System.Text.Json;

namespace PhysioBoo.Infrastructure.Entries
{
    public class AuditEntry
    {
        public EntityEntry Entry { get; }
        public Guid? UserId { get; set; }
        public string TableName { get; set; } = string.Empty;
        public Dictionary<string, object> KeyValues { get; } = new();
        public Dictionary<string, object> OldValues { get; } = new();
        public Dictionary<string, object> NewValues { get; } = new();
        public List<string> AffectedColumns { get; } = new();
        public List<PropertyEntry> TemporaryProperties { get; } = new();
        public bool IsSoftDelete { get; set; } = false;
        public string IpAddress { get; set; } = string.Empty;
        public string UserAgent { get; set; } = string.Empty;
        public string RequestId { get; set; } = string.Empty;

        public AuditEntry(EntityEntry entry)
        {
            Entry = entry;
        }

        public Sys_AuditLog ToAudit()
        {
            Sys_AuditLog audit = new Sys_AuditLog(
                Guid.NewGuid(),
                UserId,
                Entry.State switch
                {
                    EntityState.Added => AuditAction.Create,
                    EntityState.Deleted => AuditAction.Delete,
                    EntityState.Modified when IsSoftDelete => AuditAction.SoftDelete,
                    EntityState.Modified => AuditAction.Update,
                    _ => AuditAction.None
                },
                TableName,
                JsonSerializer.Serialize(KeyValues),
                OldValues.Count == 0 ? null : JsonSerializer.Serialize(OldValues),
                NewValues.Count == 0 ? null : JsonSerializer.Serialize(NewValues),
                AffectedColumns.Count == 0 ? null : JsonSerializer.Serialize(AffectedColumns),
                IpAddress,
                UserAgent,
                RequestId
            );

            return audit;
        }
    }
}
