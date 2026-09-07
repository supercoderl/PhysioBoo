

using PhysioBoo.Domain.Entities.Clinical;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class PrescriptionTemplateItemConfiguration : IEntityTypeConfiguration<PrescriptionTemplateItem>
    {
        public void Configure(EntityTypeBuilder<PrescriptionTemplateItem> builder)
        {
            // Naming
            builder.ToTable("PrescriptionTemplateItems");

            // PK
            builder.HasKey(i => i.Id);

            // Indexes
            builder.HasIndex(i => i.PrescriptionTemplateId);
            builder.HasIndex(i => i.MedicineId);

            // Relationships
            builder.HasOne(i => i.PrescriptionTemplate)
                   .WithMany(t => t.PrescriptionTemplateItems)
                   .HasForeignKey(i => i.PrescriptionTemplateId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(i => i.Medicine)
                   .WithMany(m => m.PrescriptionTemplateItems)
                   .HasForeignKey(i => i.MedicineId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(i => i.Creator)
                   .WithMany(u => u.CreatedPrescriptionTemplateItems)
                   .HasForeignKey(i => i.CreatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(i => i.Updater)
                   .WithMany(u => u.UpdatedPrescriptionTemplateItems)
                   .HasForeignKey(i => i.UpdatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(i => i.HospitalGroup)
                   .WithMany(hg => hg.PrescriptionTemplateItems)
                   .HasForeignKey(i => i.TenantId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(i => i.DefaultQuantity).IsRequired();

            builder.Property(i => i.DefaultDosageInstructions)
                   .IsRequired();

            builder.Property(i => i.DefaultFrequency)
                   .IsRequired()
                   .HasMaxLength(50);

            builder.Property(i => i.DefaultDurationInDays).IsRequired();
            builder.Property(i => i.DefaultRouteOfAdministration).HasMaxLength(50);

            builder.Property(i => i.TimingMorning).IsRequired();
            builder.Property(i => i.TimingNoon).IsRequired();
            builder.Property(i => i.TimingAfternoon).IsRequired();
            builder.Property(i => i.TimingEvening).IsRequired();
            builder.Property(i => i.IsPrn).IsRequired();

            builder.Property(i => i.BeforeAfterMeal)
                   .HasConversion<string>()
                   .IsRequired();

            builder.Property(i => i.Unit)
                   .IsRequired()
                   .HasMaxLength(30);

            builder.Property(i => i.SortOrder).IsRequired();
        }
    }
}
