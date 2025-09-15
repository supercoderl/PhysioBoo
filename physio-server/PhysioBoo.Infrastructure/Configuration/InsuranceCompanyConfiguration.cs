using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PhysioBoo.Domain.Entities.Support;

namespace PhysioBoo.Infrastructure.Configuration
{
    public sealed class InsuranceCompanyConfiguration : IEntityTypeConfiguration<InsuranceCompany>
    {
        public void Configure(EntityTypeBuilder<InsuranceCompany> builder)
        {
            // PK
            builder.HasKey(i => i.Id);

            // Indexes
            builder.HasIndex(i => i.Name);
            builder.HasIndex(i => i.Code).IsUnique(false);

            // Properties
            builder.Property(i => i.Name)
                   .IsRequired()
                   .HasMaxLength(255);

            builder.Property(i => i.Code)
                   .HasMaxLength(20);

            builder.Property(i => i.Type)
                   .HasConversion<string>()
                   .HasMaxLength(50)
                   .IsRequired();

            builder.Property(i => i.ContactPerson)
                   .HasMaxLength(255);

            builder.Property(i => i.Phone)
                   .HasMaxLength(20);

            builder.Property(i => i.Email)
                   .HasMaxLength(255);

            builder.Property(i => i.Address);

            builder.Property(i => i.Website)
                   .HasMaxLength(255);

            builder.Property(i => i.CashlessFacility).IsRequired();
            builder.Property(i => i.ReimbursementFacility).IsRequired();

            builder.Property(i => i.NetworkHospitals)
                   .HasColumnType("jsonb");

            builder.Property(i => i.MaximumCoverageAmount)
                   .HasColumnType("numeric(15,2)");

            builder.Property(i => i.ClaimSettlementRatio)
                   .HasColumnType("numeric(5,2)");

            builder.Property(i => i.AverageClaimSettlementTime)
                   .IsRequired();

            builder.Property(i => i.RequiredDocuments)
                   .HasColumnType("text[]");

            builder.Property(i => i.TermAndConditions);

            builder.Property(i => i.IsActive).IsRequired();

            builder.Property(i => i.CreatedAt).IsRequired();
        }
    }
}
