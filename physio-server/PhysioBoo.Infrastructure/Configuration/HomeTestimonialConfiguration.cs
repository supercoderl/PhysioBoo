using PhysioBoo.Domain.Entities.Cms;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class HomeTestimonialConfiguration : IEntityTypeConfiguration<HomeTestimonial>
    {
        public void Configure(EntityTypeBuilder<HomeTestimonial> builder)
        {
            // Naming
            builder.ToTable("HomeTestimonials");

            // PK
            builder.HasKey(x => x.Id);

            // Indexes: the public home page reads active items in display order
            builder.HasIndex(x => new { x.TenantId, x.Active, x.Date });

            // Relationships
            // (none)

            // Properties
            builder.Property(x => x.PatientName)
                   .IsRequired()
                   .HasMaxLength(150);
            builder.Property(x => x.Rating);
            builder.Property(x => x.Comment)
                   .HasMaxLength(2000);
            builder.Property(x => x.Date);
            builder.Property(x => x.Active);
        }
    }
}
