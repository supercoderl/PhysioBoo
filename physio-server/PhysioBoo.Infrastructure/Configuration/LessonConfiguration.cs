using PhysioBoo.Domain.Entities.Academy;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class LessonConfiguration : IEntityTypeConfiguration<Lesson>
    {
        public void Configure(EntityTypeBuilder<Lesson> builder)
        {
            // Naming
            builder.ToTable("Lessons");

            // PK
            builder.HasKey(l => l.Id);

            // Indexes
            builder.HasIndex(l => new { l.CourseId, l.Position });

            // Relationships
            builder.HasOne<Course>()
                   .WithMany()
                   .HasForeignKey(l => l.CourseId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Properties
            builder.Property(l => l.Title)
                   .IsRequired()
                   .HasMaxLength(200);

            builder.Property(l => l.Content)
                   .IsRequired()
                   .HasMaxLength(20000);

            builder.Property(l => l.DurationMinutes)
                   .IsRequired();

            builder.Property(l => l.Position)
                   .IsRequired();
        }
    }
}
