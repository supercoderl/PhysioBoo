using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Support;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class ReviewConfiguration : IEntityTypeConfiguration<Review>
    {
        public void Configure(EntityTypeBuilder<Review> builder)
        {
            // PK
            builder.HasKey(r => r.Id);

            // Indexes
            builder.HasIndex(r => r.ReviewerId);
            builder.HasIndex(r => r.EntityId);
            builder.HasIndex(r => r.AppointmentId);

            // Relationships
            builder.HasOne(r => r.Reviewer)
                   .WithMany(u => u.Reviews)
                   .HasForeignKey(r => r.ReviewerId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(r => r.Appointment)
                   .WithMany(a => a.Reviews)
                   .HasForeignKey(r => r.AppointmentId);

            builder.HasOne(r => r.Moderator)
                   .WithMany(u => u.ModeratedReviews)
                   .HasForeignKey(r => r.ModeratedBy);

            builder.HasOne(r => r.Responder)
                   .WithMany(u => u.Responses)
                   .HasForeignKey(r => r.RespondedBy);

            // Properties
            builder.Property(r => r.ReviewType)
                   .HasConversion<string>()
                   .HasMaxLength(30)
                   .IsRequired();

            builder.Property(r => r.EntityId).IsRequired();

            builder.Property(r => r.OverallRating).IsRequired();
            builder.Property(r => r.DoctorPunctuality).IsRequired();
            builder.Property(r => r.DoctorBehavior).IsRequired();
            builder.Property(r => r.TreatmentSatisfaction).IsRequired();
            builder.Property(r => r.FacilityCleanliness).IsRequired();
            builder.Property(r => r.StaffBehavior).IsRequired();
            builder.Property(r => r.ValueForMoney).IsRequired();

            builder.Property(r => r.Title).HasMaxLength(255);
            builder.Property(r => r.Comment);
            builder.Property(r => r.Pros);
            builder.Property(r => r.Cons);

            builder.Property(r => r.WouldRecommend).IsRequired();
            builder.Property(r => r.VisitedFor);
            builder.Property(r => r.WaitTimeMinutes).IsRequired();

            builder.Property(r => r.IsVerified).IsRequired();
            builder.Property(r => r.IsAnonymous).IsRequired();
            builder.Property(r => r.IsPublished).IsRequired();
            builder.Property(r => r.IsFeatured).IsRequired();

            builder.Property(r => r.HelpfulCount).IsRequired();
            builder.Property(r => r.NotHelpfulCount).IsRequired();
            builder.Property(r => r.ReportedCount).IsRequired();

            builder.Property(r => r.ModerationStatus)
                   .HasConversion<string>()
                   .HasMaxLength(20)
                   .IsRequired();

            builder.Property(r => r.ModerationNotes);
            builder.Property(r => r.ModeratedAt);

            builder.Property(r => r.ResponseText);
            builder.Property(r => r.ResponseDate);

            builder.Property(r => r.CreatedAt).IsRequired();
            builder.Property(r => r.UpdatedAt);
        }
    }
}
