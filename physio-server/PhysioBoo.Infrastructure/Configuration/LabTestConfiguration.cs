using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.LaboratoryImaging;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class LabTestConfiguration : IEntityTypeConfiguration<LabTest>
    {
        public void Configure(EntityTypeBuilder<LabTest> builder)
        {
            // PK
            builder.HasKey(t => t.Id);

            // Indexes
            builder.HasIndex(t => t.TestName);
            builder.HasIndex(t => t.TestCode).IsUnique(false);
            builder.HasIndex(t => t.CategoryId);

            // Relationships
            builder.HasOne(t => t.Category)
                   .WithMany(c => c.LabTests)
                   .HasForeignKey(t => t.CategoryId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(t => t.TestName)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(t => t.TestCode)
                   .HasMaxLength(20);

            builder.Property(t => t.Description);

            builder.Property(t => t.SampleType)
                   .HasMaxLength(100);

            builder.Property(t => t.SampleVolume)
                   .HasMaxLength(50);

            builder.Property(t => t.CollectionInstructions);

            builder.Property(t => t.PreparationRequired).IsRequired();

            builder.Property(t => t.PreparationInstructions);

            builder.Property(t => t.FastingRequired).IsRequired();
            builder.Property(t => t.FastingHours).IsRequired();

            builder.Property(t => t.NormalRangeMale);
            builder.Property(t => t.NormalRangeFemale);
            builder.Property(t => t.NormalPediatric);

            builder.Property(t => t.UnitOfMeasurement).HasMaxLength(50);
            builder.Property(t => t.Methodology).HasMaxLength(255);

            builder.Property(t => t.ReportingTimeHours).IsRequired();

            builder.Property(t => t.Cost)
                   .HasColumnType("numeric(8,2)")
                   .IsRequired();

            builder.Property(t => t.IsProfile).IsRequired();
            builder.Property(t => t.IsUrgentAvailable).IsRequired();

            builder.Property(t => t.UrgentCost)
                   .HasColumnType("numeric(8,2)")
                   .IsRequired();

            builder.Property(t => t.UrgentReportingTimeHours).IsRequired();

            builder.Property(t => t.IsHomeCollectionAvailable).IsRequired();

            builder.Property(t => t.HomeCollectionCharge)
                   .HasColumnType("numeric(8,2)")
                   .IsRequired();

            builder.Property(t => t.RequiresAppoinment).IsRequired();

            builder.Property(t => t.IsActive).IsRequired();

            builder.Property(t => t.CreatedAt).IsRequired();
        }
    }
}
