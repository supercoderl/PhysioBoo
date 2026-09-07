

using PhysioBoo.Domain.Entities.Clinical;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class RetailCartConfiguration : IEntityTypeConfiguration<RetailCart>
    {
        public void Configure(EntityTypeBuilder<RetailCart> builder)
        {
            // Naming
            builder.ToTable("RetailCarts");

            // PK
            builder.HasKey(c => c.Id);

            // Indexes
            builder.HasIndex(c => c.HospitalId);
            builder.HasIndex(c => c.Status);

            // Relationships
            builder.HasOne(c => c.Hospital)
                   .WithMany(h => h.RetailCarts)
                   .HasForeignKey(c => c.HospitalId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(c => c.CustomerPatient)
                   .WithMany(p => p.RetailCarts)
                   .HasForeignKey(c => c.CustomerPatientId)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(c => c.Creator)
                   .WithMany(u => u.CreatedRetailCarts)
                   .HasForeignKey(c => c.CreatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(c => c.Updater)
                   .WithMany(u => u.UpdatedRetailCarts)
                   .HasForeignKey(c => c.UpdatedBy)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(c => c.HospitalGroup)
                   .WithMany(hg => hg.RetailCarts)
                   .HasForeignKey(c => c.TenantId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(c => c.Name)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(c => c.Status)
                   .HasConversion<string>()
                   .IsRequired();

            builder.Property(c => c.CustomerType).HasConversion<string>();
            builder.Property(c => c.CustomerFullName).HasMaxLength(200);
            builder.Property(c => c.CustomerPhone).HasMaxLength(30);
            builder.Property(c => c.CustomerMrn).HasMaxLength(50);
            builder.Property(c => c.CustomerInsuranceProvider).HasMaxLength(200);
            builder.Property(c => c.CustomerInsuranceCoverageAmount).HasColumnType("numeric(10,2)");
            builder.Property(c => c.CustomerPrescriptionReference).HasMaxLength(100);
            builder.Property(c => c.CustomerAllergyInformation).HasMaxLength(1000);
        }
    }
}
