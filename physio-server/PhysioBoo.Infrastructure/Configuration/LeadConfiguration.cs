using PhysioBoo.Domain.Entities.Crm;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class LeadConfiguration : IEntityTypeConfiguration<Lead>
    {
        public void Configure(EntityTypeBuilder<Lead> builder)
        {
            // Naming
            builder.ToTable("Leads");

            // PK
            builder.HasKey(l => l.Id);

            // Indexes
            builder.HasIndex(l => l.Status);
            builder.HasIndex(l => l.Priority);
            builder.HasIndex(l => l.Phone);
            builder.HasIndex(l => l.Email);

            // Relationships
            // (none: Service, Source and AssignedTo are free-text strings for now)

            // Properties
            builder.Property(l => l.Name)
                   .IsRequired()
                   .HasMaxLength(120);

            builder.Property(l => l.Phone)
                   .IsRequired()
                   .HasMaxLength(32);

            builder.Property(l => l.Email)
                   .IsRequired()
                   .HasMaxLength(254);

            builder.Property(l => l.Service)
                   .IsRequired()
                   .HasMaxLength(64);

            builder.Property(l => l.Source)
                   .IsRequired()
                   .HasMaxLength(64);

            builder.Property(l => l.Status)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(l => l.Priority)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(l => l.AssignedTo)
                   .HasMaxLength(120);

            builder.Property(l => l.Notes)
                   .HasMaxLength(2000);
        }
    }
}
