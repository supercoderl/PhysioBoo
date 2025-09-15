using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.LaboratoryImaging;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class LabOrderItemConfiguration : IEntityTypeConfiguration<LabOrderItem>
    {
        public void Configure(EntityTypeBuilder<LabOrderItem> builder)
        {
            // PK
            builder.HasKey(i => i.Id);

            // Indexes
            builder.HasIndex(i => i.LabOrderId);
            builder.HasIndex(i => i.LabTestId);

            // Relationships
            builder.HasOne(i => i.LabOrder)
                   .WithMany(o => o.LabOrderItems)
                   .HasForeignKey(i => i.LabOrderId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(i => i.LabTest)
                   .WithMany(t => t.LabOrderItems)
                   .HasForeignKey(i => i.LabTestId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(i => i.SampleCollector)
                   .WithMany(u => u.CollectedLabSamples)
                   .HasForeignKey(i => i.SampleCollectorId);

            builder.HasOne(i => i.Technician)
                   .WithMany(u => u.ProcessedLabTests)
                   .HasForeignKey(i => i.TechnicianId);

            builder.HasOne(i => i.Verifier)
                   .WithMany(u => u.VerifiedLabTests)
                   .HasForeignKey(i => i.VerifiedBy);

            // Properties
            builder.Property(i => i.TestName)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(i => i.IsUrgent).IsRequired();
            builder.Property(i => i.SampleCollected).IsRequired();
            builder.Property(i => i.SampleCollectionTime);

            builder.Property(i => i.TestCost)
                   .HasColumnType("numeric(8,2)")
                   .IsRequired();

            builder.Property(i => i.Status)
                   .HasConversion<string>()
                   .HasMaxLength(30)
                   .IsRequired();

            builder.Property(i => i.ResultValue);
            builder.Property(i => i.ResultUnit).HasMaxLength(50);
            builder.Property(i => i.ReferenceRange);
            builder.Property(i => i.AbnormalFlag).HasMaxLength(10);

            builder.Property(i => i.CritialFlag).IsRequired();

            builder.Property(i => i.VerifiedAt);
            builder.Property(i => i.Notes);

            builder.Property(i => i.CreatedAt).IsRequired();
        }
    }
}
