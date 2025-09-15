using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Operation;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class BillConfiguration : IEntityTypeConfiguration<Bill>
    {
        public void Configure(EntityTypeBuilder<Bill> builder)
        {
            // PK
            builder.HasKey(b => b.Id);

            // Indexes
            builder.HasIndex(b => b.BillNumber).IsUnique();
            builder.HasIndex(b => b.PatientId);
            builder.HasIndex(b => b.AppointmentId);
            builder.HasIndex(b => b.HospitalId);
            builder.HasIndex(b => b.DepartmentId);

            // Relationships
            builder.HasOne(b => b.Patient)
                   .WithMany(p => p.Bills)
                   .HasForeignKey(b => b.PatientId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(b => b.Appointment)
                   .WithMany(a => a.Bills)
                   .HasForeignKey(b => b.AppointmentId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(b => b.Hospital)
                   .WithMany(h => h.Bills)
                   .HasForeignKey(b => b.HospitalId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(b => b.Department)
                   .WithMany(d => d.Bills)
                   .HasForeignKey(b => b.DepartmentId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(b => b.InsuranceCompany)
                   .WithMany(i => i.Bills)
                   .HasForeignKey(b => b.InsuranceCompanyId);

            builder.HasOne(b => b.Creator)
                   .WithMany(u => u.CreatedBills)
                   .HasForeignKey(b => b.CreatedBy)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(b => b.Approver)
                   .WithMany(u => u.ApprovedBills)
                   .HasForeignKey(b => b.ApprovedBy);

            // Properties
            builder.Property(b => b.BillNumber)
                   .IsRequired()
                   .HasMaxLength(50);

            builder.Property(b => b.Type)
                   .HasConversion<string>()  // store enum as string
                   .HasMaxLength(50)
                   .IsRequired();

            builder.Property(b => b.BillDate).IsRequired();
            builder.Property(b => b.BillTime).IsRequired();

            builder.Property(b => b.Subtotal).HasColumnType("numeric(12,2)");
            builder.Property(b => b.TaxAmount).HasColumnType("numeric(12,2)");
            builder.Property(b => b.DiscountAmount).HasColumnType("numeric(12,2)");
            builder.Property(b => b.TotalAmount).HasColumnType("numeric(12,2)");
            builder.Property(b => b.PaidAmount).HasColumnType("numeric(12,2)");
            builder.Property(b => b.OutstandingAmount).HasColumnType("numeric(12,2)");

            builder.Property(b => b.PaymentStatus)
                   .HasConversion<string>()
                   .HasMaxLength(20)
                   .IsRequired();

            builder.Property(b => b.PaymentTerms).HasMaxLength(100);
            builder.Property(b => b.Currency).IsRequired().HasMaxLength(10);
            builder.Property(b => b.ExchangeRate).HasColumnType("numeric(12,4)");

            builder.Property(b => b.InsuranceClaimNumber).HasMaxLength(100);
            builder.Property(b => b.InsuranceApprovedAmount).HasColumnType("numeric(12,2)");
            builder.Property(b => b.InsurancePaidAmount).HasColumnType("numeric(12,2)");
            builder.Property(b => b.PatientCopayAmount).HasColumnType("numeric(12,2)");

            builder.Property(b => b.Notes);
            builder.Property(b => b.TermsAndConditions);

            builder.Property(b => b.CreatedAt).IsRequired();
            builder.Property(b => b.UpdatedAt).IsRequired(false);
            builder.Property(b => b.ApprovedAt).IsRequired(false);
        }
    }
}
