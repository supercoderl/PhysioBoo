namespace PhysioBoo.Domain.Entities
{
    public abstract class TenantEntity : AuditEntity
    {
        public Guid TenantId { get; set; }

        protected TenantEntity(Guid id) : base(id)
        {
        }

        protected TenantEntity(Guid id, Guid tenantId) : base(id)
        {
            TenantId = tenantId;
        }

        public void SetTenantId(Guid tenantId) { TenantId = tenantId; }
    }
}
