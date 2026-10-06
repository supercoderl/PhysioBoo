using PhysioBoo.Domain.Entities.Academy;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class CourseConfiguration : IEntityTypeConfiguration<Course>
    {
        public void Configure(EntityTypeBuilder<Course> builder)
        {
            // Naming
            builder.ToTable("Courses");

            // PK
            builder.HasKey(c => c.Id);

            // Indexes
            builder.HasIndex(c => new { c.TenantId, c.IsPublished });
            builder.HasIndex(c => c.Category);

            // Relationships
            // (none: lessons and completions point at the course)

            // Properties
            builder.Property(c => c.Title)
                   .IsRequired()
                   .HasMaxLength(200);

            builder.Property(c => c.Description)
                   .HasMaxLength(2000);

            builder.Property(c => c.Category)
                   .IsRequired()
                   .HasMaxLength(60);

            builder.Property(c => c.IsPublished)
                   .IsRequired();
        }
    }
}
