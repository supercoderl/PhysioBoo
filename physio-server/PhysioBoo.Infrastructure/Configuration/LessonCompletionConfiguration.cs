using PhysioBoo.Domain.Entities.Academy;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class LessonCompletionConfiguration : IEntityTypeConfiguration<LessonCompletion>
    {
        public void Configure(EntityTypeBuilder<LessonCompletion> builder)
        {
            // Naming
            builder.ToTable("LessonCompletions");

            // PK
            builder.HasKey(c => c.Id);

            // Indexes
            // A user finishes a lesson once: the database-level guard behind the check in the handler.
            builder.HasIndex(c => new { c.LessonId, c.UserId })
                   .IsUnique()
                   .HasDatabaseName("IX_LessonCompletions_Lesson_User")
                   .HasFilter("\"DeletedAt\" IS NULL");
            builder.HasIndex(c => new { c.UserId, c.CourseId });

            // Relationships
            builder.HasOne<Lesson>()
                   .WithMany()
                   .HasForeignKey(c => c.LessonId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<Course>()
                   .WithMany()
                   .HasForeignKey(c => c.CourseId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Properties
            builder.Property(c => c.UserId)
                   .IsRequired();

            builder.Property(c => c.CompletedAt)
                   .IsRequired();
        }
    }
}
