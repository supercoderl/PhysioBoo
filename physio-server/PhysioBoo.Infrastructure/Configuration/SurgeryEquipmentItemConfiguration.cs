using PhysioBoo.Domain.Entities.Theatre;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class SurgeryEquipmentItemConfiguration : IEntityTypeConfiguration<SurgeryEquipmentItem>
    {
        public void Configure(EntityTypeBuilder<SurgeryEquipmentItem> builder)
        {
            // Naming
            builder.ToTable("SurgeryEquipmentItems");

            // PK
            builder.HasKey(e => e.Id);

            // Indexes
            builder.HasIndex(e => e.SurgeryCaseId);
            builder.HasIndex(e => e.Status);

            // Relationships
            builder.HasOne(e => e.SurgeryCase)
                   .WithMany(c => c.Equipment)
                   .HasForeignKey(e => e.SurgeryCaseId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(e => e.Name)
                   .IsRequired()
                   .HasMaxLength(200);

            builder.Property(e => e.Category)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(e => e.Status)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(e => e.Quantity)
                   .IsRequired();
        }
    }
}
