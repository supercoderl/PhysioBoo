using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.LaboratoryImaging;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class ImagingModalityConfiguration : IEntityTypeConfiguration<ImagingModality>
    {
        public void Configure(EntityTypeBuilder<ImagingModality> builder)
        {
            // PK
            builder.HasKey(i => i.Id);

            // Indexes
            builder.HasIndex(i => i.Code).IsUnique(false);
            builder.HasIndex(i => i.Name);

            // Properties
            builder.Property(i => i.Name)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(i => i.Code)
                   .HasMaxLength(20);

            builder.Property(i => i.Description);

            builder.Property(i => i.Category)
                   .HasMaxLength(50);

            builder.Property(i => i.RequiresContrast)
                   .IsRequired();

            builder.Property(i => i.PreparationRequired)
                   .IsRequired();

            builder.Property(i => i.PreparationInstructions);

            builder.Property(i => i.AverageDurationMinutes)
                   .IsRequired();

            builder.Property(i => i.RadiationDose)
                   .HasColumnType("numeric(8,4)")  // ví dụ: 1234.567 mSv
                   .IsRequired();

            builder.Property(i => i.IsActive)
                   .IsRequired();

            builder.Property(i => i.CreatedAt)
                   .IsRequired();
        }
    }
}
