using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Domain.Entities.System
{
    public class PrintLog : Entity
    {
        public Guid TemplateVersionId { get; private set; }
        public Guid PrintedBy { get; private set; }
        public DateTime PrintedAt { get; private set; }
        public string EntityType { get; private set; }
        public Guid EntityId { get; private set; }

        public virtual User? PrintedByUser { get; private set; }

        public PrintLog(
            Guid id,
            Guid templateVersionId,
            Guid printedBy,
            DateTime printedAt,
            string entityType,
            Guid entityId
        ) : base(id)
        {
            TemplateVersionId = templateVersionId;
            PrintedBy = printedBy;
            PrintedAt = printedAt;
            EntityType = entityType;
            EntityId = entityId;
        }

        public void SetTemplateVersionId(Guid templateVersionId) { TemplateVersionId = templateVersionId; }
        public void SetPrintedBy(Guid printedBy) { PrintedBy = printedBy; }
        public void SetPrintedAt(DateTime printedAt) { PrintedAt = printedAt; }
        public void SetEntityType(string entityType) { EntityType = entityType; }
        public void SetEntityId(Guid entityId) { EntityId = entityId; }
    }
}
