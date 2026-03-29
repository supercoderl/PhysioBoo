using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Clinical;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class PrescriptionItemConfiguration : IEntityTypeConfiguration<PrescriptionItem>
    {
        public void Configure(EntityTypeBuilder<PrescriptionItem> builder)
        {
            // Naming
            builder.ToTable("PrescriptionItems");

            // PK
            builder.HasKey(i => i.Id);

            // Indexes
            builder.HasIndex(i => i.PrescriptionId);
            builder.HasIndex(i => i.MedicineId);

            // Relationships
            builder.HasOne(i => i.Prescription)
                   .WithMany(p => p.PrescriptionItems)
                   .HasForeignKey(i => i.PrescriptionId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(i => i.Medicine)
                   .WithMany(m => m.PrescriptionItems)
                   .HasForeignKey(i => i.MedicineId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(i => i.Creator)
                   .WithMany(u => u.CreatedPrescriptionItems)
                   .HasForeignKey(i => i.CreatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(i => i.Updater)
                   .WithMany(u => u.UpdatedPrescriptionItems)
                   .HasForeignKey(i => i.UpdatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(i => i.HospitalGroup)
                   .WithMany(hg => hg.PrescriptionItems)
                   .HasForeignKey(i => i.TenantId)
                   .OnDelete(DeleteBehavior.Cascade);
            // Properties
            builder.Property(i => i.MedicineName)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(i => i.GenericName).HasMaxLength(255);
            builder.Property(i => i.Strength).HasMaxLength(50);
            builder.Property(i => i.DosageForm).HasMaxLength(50);

            builder.Property(i => i.QuantityPrescribed).IsRequired();
            builder.Property(i => i.QuantityDispensed).IsRequired();

            builder.Property(i => i.DosageInstructions)
                   .IsRequired();

            builder.Property(i => i.Frequency)
                   .IsRequired()
                   .HasMaxLength(50);

            builder.Property(i => i.DurationInDays).IsRequired();

            builder.Property(i => i.RouteOfAdministration).HasMaxLength(50);
            builder.Property(i => i.SpecialInstructions);

            builder.Property(i => i.PricePerUnit)
                   .HasColumnType("numeric(8,2)")
                   .IsRequired();

            builder.Property(i => i.TotalPrice)
                   .HasColumnType("numeric(10,2)")
                   .IsRequired();

            builder.Property(i => i.SubtituteAllowed).IsRequired();
            builder.Property(i => i.IsControlledSubstance).IsRequired();
        }
    }
}
