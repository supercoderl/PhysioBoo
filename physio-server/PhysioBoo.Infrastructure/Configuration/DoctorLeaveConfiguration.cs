using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.MedicalStaff;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class DoctorLeaveConfiguration : IEntityTypeConfiguration<DoctorLeave>
    {
        public void Configure(EntityTypeBuilder<DoctorLeave> builder)
        {
            // PK
            builder.HasKey(l => l.Id);

            // Indexes
            builder.HasIndex(l => l.DoctorId);
            builder.HasIndex(l => l.ApprovedBy);
            builder.HasIndex(l => l.SubstituteDoctorId);

            // Relationships
            builder.HasOne(l => l.Doctor)
                   .WithMany(d => d.Leaves)
                   .HasForeignKey(l => l.DoctorId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(l => l.Approver)
                   .WithMany(u => u.ApprovedLeaves)
                   .HasForeignKey(l => l.ApprovedBy);

            builder.HasOne(l => l.SubstituteDoctor)
                   .WithMany(d => d.SubstitutedLeaves)
                   .HasForeignKey(l => l.SubstituteDoctorId);

            // Properties
            builder.Property(l => l.LeaveType)
                   .HasConversion<string>()
                   .HasMaxLength(50)
                   .IsRequired();

            builder.Property(l => l.StartDate).IsRequired();
            builder.Property(l => l.EndDate).IsRequired();

            builder.Property(l => l.StartTime);
            builder.Property(l => l.EndTime);

            builder.Property(l => l.TotalDays)
                   .HasColumnType("numeric(3,1)")
                   .IsRequired();

            builder.Property(l => l.Reason);

            builder.Property(l => l.Status)
                   .HasConversion<string>()
                   .HasMaxLength(20)
                   .IsRequired();

            builder.Property(l => l.ApprovedAt);

            builder.Property(l => l.EmergencyContact)
                   .HasMaxLength(20);

            builder.Property(l => l.DocumentsUrl)
                   .HasMaxLength(500);

            builder.Property(l => l.CreatedAt)
                   .IsRequired();

            builder.Property(l => l.UpdatedAt);
        }
    }
}
