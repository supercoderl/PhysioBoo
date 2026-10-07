using PhysioBoo.Domain.Entities.LaboratoryImaging;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class RadiologyAlertConfiguration : IEntityTypeConfiguration<RadiologyAlert>
    {
        public void Configure(EntityTypeBuilder<RadiologyAlert> builder)
        {
            // Naming
            builder.ToTable("RadiologyAlerts");

            // PK
            builder.HasKey(a => a.Id);

            // Indexes: the workspace lists open alerts, newest first
            builder.HasIndex(a => new { a.TenantId, a.Acknowledged, a.RaisedAt });
            builder.HasIndex(a => a.ImagingOrderId);

            // Relationships
            // (none: the order id is a soft reference, names are copied at raise time)

            // Properties
            builder.Property(a => a.Type)
                   .HasConversion<string>()
                   .HasMaxLength(32)
                   .IsRequired();

            builder.Property(a => a.Severity)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(a => a.Description)
                   .IsRequired()
                   .HasMaxLength(500);

            builder.Property(a => a.PatientName)
                   .HasMaxLength(200);

            builder.Property(a => a.OrderNumber)
                   .HasMaxLength(50);

            builder.Property(a => a.RaisedAt)
                   .IsRequired();

            builder.Property(a => a.Notified)
                   .IsRequired();

            builder.Property(a => a.Acknowledged)
                   .IsRequired();
        }
    }
}
