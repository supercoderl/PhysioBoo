using PhysioBoo.Domain.Entities.Crm;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class CampaignConfiguration : IEntityTypeConfiguration<Campaign>
    {
        public void Configure(EntityTypeBuilder<Campaign> builder)
        {
            // Naming
            builder.ToTable("Campaigns");

            // PK
            builder.HasKey(c => c.Id);

            // Indexes
            builder.HasIndex(c => c.Code).IsUnique();
            builder.HasIndex(c => c.Status);
            builder.HasIndex(c => c.Type);
            builder.HasIndex(c => c.StartDate);

            // Relationships
            // (none yet: AudienceSegmentId is a plain Guid until the AudienceSegment entity exists)

            // Properties
            builder.Property(c => c.Code)
                   .IsRequired()
                   .HasMaxLength(32);

            builder.Property(c => c.Name)
                   .IsRequired()
                   .HasMaxLength(120);

            builder.Property(c => c.Type)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(c => c.Status)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(c => c.AudienceSegmentId);

            builder.Property(c => c.Goal)
                   .HasMaxLength(255);

            builder.Property(c => c.StartDate)
                   .HasColumnType("date");

            builder.Property(c => c.EndDate)
                   .HasColumnType("date");

            builder.Property(c => c.Budget)
                   .HasPrecision(18, 2);

            builder.Property(c => c.Spent)
                   .HasPrecision(18, 2);

            builder.Property(c => c.Reach);

            builder.Property(c => c.Conversions);

            builder.Property(c => c.Description)
                   .HasMaxLength(2000);
        }
    }
}
