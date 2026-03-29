namespace PhysioBoo.Domain.Entities
{
    public abstract class TenantEntity : AuditEntity
    {
        public Guid TenantId { get; set; }

        protected TenantEntity(Guid id) : base(id)
        {
        }

        public void SetTenantId(Guid tenantId) { TenantId = tenantId; }
    }
}
