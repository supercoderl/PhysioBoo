using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Domain.Entities
{
    public abstract class AuditEntity : Entity
    {
        public DateTime CreatedAt { get; private set; }
        public Guid? CreatedBy { get; private set; }
        public DateTime? UpdatedAt { get; private set; }
        public Guid? UpdatedBy { get; private set; }

        protected AuditEntity(Guid id) : base(id)
        {
            CreatedAt = TimeZoneHelper.GetLocalTimeNow();
            UpdatedAt = null;
        }

        public void SetCreatedAt(DateTime createdAt) { CreatedAt = createdAt; }
        public void SetUpdatedAt(DateTime? updatedAt) { UpdatedAt = updatedAt; }
        public void SetCreatedBy(Guid? createdBy) { CreatedBy = createdBy; }
        public void SetUpdatedBy(Guid? updatedBy) { UpdatedBy = updatedBy; }
    }
}
