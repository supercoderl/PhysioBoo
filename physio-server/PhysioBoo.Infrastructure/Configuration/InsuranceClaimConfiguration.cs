using PhysioBoo.Domain.Entities.Finance;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class InsuranceClaimConfiguration : IEntityTypeConfiguration<InsuranceClaim>
    {
        public void Configure(EntityTypeBuilder<InsuranceClaim> builder)
        {
            // Naming
            builder.ToTable("InsuranceClaims");

            // PK
            builder.HasKey(c => c.Id);

            // Indexes
            builder.HasIndex(c => new { c.TenantId, c.ClaimNumber }).IsUnique();
            builder.HasIndex(c => c.Status);
            builder.HasIndex(c => c.InsuranceCompanyId);
            builder.HasIndex(c => c.PatientId);
            builder.HasIndex(c => c.BillId);

            // Relationships
            builder.HasOne(c => c.InsuranceCompany)
                   .WithMany()
                   .HasForeignKey(c => c.InsuranceCompanyId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(c => c.Patient)
                   .WithMany()
                   .HasForeignKey(c => c.PatientId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(c => c.Bill)
                   .WithMany()
                   .HasForeignKey(c => c.BillId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(c => c.Documents)
                   .WithOne(d => d.Claim)
                   .HasForeignKey(d => d.ClaimId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(c => c.Activities)
                   .WithOne(a => a.Claim)
                   .HasForeignKey(a => a.ClaimId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Properties
            builder.Property(c => c.ClaimNumber).IsRequired().HasMaxLength(32);
            builder.Property(c => c.PatientName).IsRequired().HasMaxLength(120);
            builder.Property(c => c.PolicyNumber).IsRequired().HasMaxLength(64);
            builder.Property(c => c.Diagnosis).IsRequired().HasMaxLength(500);
            builder.Property(c => c.Procedures).HasColumnType("text[]");
            builder.Property(c => c.ClaimAmount).HasColumnType("numeric(12,2)");
            builder.Property(c => c.ApprovedAmount).HasColumnType("numeric(12,2)");
            builder.Property(c => c.SettledAmount).HasColumnType("numeric(12,2)");
            builder.Property(c => c.Hospital).HasMaxLength(255);
            builder.Property(c => c.Department).HasMaxLength(120);
            builder.Property(c => c.DoctorName).HasMaxLength(120);
            builder.Property(c => c.SettlementMethod).HasMaxLength(32);
            builder.Property(c => c.RejectionReason).HasMaxLength(2000);
            builder.Property(c => c.AppealGrounds).HasMaxLength(2000);
            builder.Property(c => c.HospitalNotes).HasMaxLength(2000);

            builder.Property(c => c.Priority)
                   .HasConversion<string>()
                   .HasMaxLength(16)
                   .IsRequired();

            builder.Property(c => c.Status)
                   .HasConversion<string>()
                   .HasMaxLength(32)
                   .IsRequired();
        }
    }
}
