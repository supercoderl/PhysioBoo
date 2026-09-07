

using PhysioBoo.Domain.Entities.Clinical;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class FavoriteMedicationConfiguration : IEntityTypeConfiguration<FavoriteMedication>
    {
        public void Configure(EntityTypeBuilder<FavoriteMedication> builder)
        {
            // Naming
            builder.ToTable("FavoriteMedications");

            // PK
            builder.HasKey(f => f.Id);

            // Indexes
            builder.HasIndex(f => f.DoctorId);
            builder.HasIndex(f => f.MedicineId);
            builder.HasIndex(f => new { f.DoctorId, f.MedicineId }).IsUnique();

            // Relationships
            builder.HasOne(f => f.Doctor)
                   .WithMany(d => d.FavoriteMedications)
                   .HasForeignKey(f => f.DoctorId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(f => f.Medicine)
                   .WithMany(m => m.FavoriteMedications)
                   .HasForeignKey(f => f.MedicineId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(f => f.Creator)
                   .WithMany(u => u.CreatedFavoriteMedications)
                   .HasForeignKey(f => f.CreatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(f => f.Updater)
                   .WithMany(u => u.UpdatedFavoriteMedications)
                   .HasForeignKey(f => f.UpdatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(f => f.HospitalGroup)
                   .WithMany(hg => hg.FavoriteMedications)
                   .HasForeignKey(f => f.TenantId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(f => f.DefaultDose).HasMaxLength(100);
            builder.Property(f => f.DefaultFrequency).HasMaxLength(50);
            builder.Property(f => f.DefaultDurationInDays);
        }
    }
}
