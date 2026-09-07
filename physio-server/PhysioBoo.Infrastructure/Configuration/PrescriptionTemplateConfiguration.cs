

using PhysioBoo.Domain.Entities.Clinical;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class PrescriptionTemplateConfiguration : IEntityTypeConfiguration<PrescriptionTemplate>
    {
        public void Configure(EntityTypeBuilder<PrescriptionTemplate> builder)
        {
            // Naming
            builder.ToTable("PrescriptionTemplates");

            // PK
            builder.HasKey(t => t.Id);

            // Indexes
            builder.HasIndex(t => t.DoctorId);

            // Relationships
            builder.HasOne(t => t.Doctor)
                   .WithMany(d => d.PrescriptionTemplates)
                   .HasForeignKey(t => t.DoctorId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(t => t.Creator)
                   .WithMany(u => u.CreatedPrescriptionTemplates)
                   .HasForeignKey(t => t.CreatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(t => t.Updater)
                   .WithMany(u => u.UpdatedPrescriptionTemplates)
                   .HasForeignKey(t => t.UpdatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(t => t.HospitalGroup)
                   .WithMany(hg => hg.PrescriptionTemplates)
                   .HasForeignKey(t => t.TenantId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(t => t.Name)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(t => t.Description).HasMaxLength(1000);
            builder.Property(t => t.IsActive).IsRequired();
        }
    }
}
